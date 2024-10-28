import { Container, createTheme, MantineProvider, Stack } from '@mantine/core';
import '@mantine/core/styles.css';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Link,
  Outlet,
  Route,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';
import Wallet, {
  AddressPurpose,
  BitcoinNetworkType,
  RpcErrorCode,
  type Address,
} from 'sats-connect';
import { Button, ConnectButtonsContainer, Header, Logo } from './App.styles';
import { GetAccounts } from './components/bitcoin/GetAccounts';
import { GetBtcBalance } from './components/bitcoin/GetBtcBalance';
import { SignMessage } from './components/bitcoin/SignMessage';
import { GetInscriptions } from './components/GetInscriptions';
import { GetRunesBalance } from './components/GetRunesBalance';
import { SendInscription } from './components/sendInscriptions';

import AddressDisplay from './components/AddressDisplay';
import { GetAddresses } from './components/bitcoin/GetAddresses.tsx';
import { SendBtc } from './components/bitcoin/SendBtc';
import EtchRunes from './components/EtchRunes';
import MintRunes from './components/MintRunes';
import { MobileUniversalLink } from './components/mobile/universalLink.tsx';
import { NetworkSelector } from './components/NetworkSelector';
import { SendSip10 } from './components/stacks/SendSip10';
import { SendStx } from './components/stacks/SendStx';
import { SignTransaction } from './components/stacks/SignTransaction.tsx';
import TransferRunes from './components/transferRunes/index.tsx';
import { GetPermissions } from './components/wallet/GetPermissions.tsx';
import { WalletType } from './components/wallet/WalletType';
import { useLocalStorage } from './hooks';
import { CollapseDesktop } from './layouts/CollapseDesktop';

const ConnectionContext = createContext<{
  accountId: string | null;
  network: BitcoinNetworkType;
  btcAddressInfo: Address[];
  stxAddressInfo: Address[];
  onDisconnect: () => void;
}>({
  accountId: null,
  network: BitcoinNetworkType.Mainnet,
  btcAddressInfo: [],
  stxAddressInfo: [],
  onDisconnect: () => {
    console.log('onDisconnect not implemented');
  },
});

const useConnectionContext = () => useContext(ConnectionContext);

const whiteListedPaths = ['/mobile-universal-link'];

function AppWithProviders({ children }: React.PropsWithChildren) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [network, setNetwork] = useLocalStorage<BitcoinNetworkType>(
    'network',
    BitcoinNetworkType.Mainnet,
  );
  const [accountId, setAccountId] = useState<string | null>(null);
  const [btcAddressInfo, setBtcAddressInfo] = useState<Address[]>([]);
  const [stxAddressInfo, setStxAddressInfo] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isConnected = btcAddressInfo.length + stxAddressInfo.length > 0;

  const isWhiteListedPath = whiteListedPaths.includes(window.location.pathname);

  const clearAppData = useCallback(() => {
    setAccountId(null);
    setBtcAddressInfo([]);
    setStxAddressInfo([]);
    queryClient.clear();
  }, [queryClient, setBtcAddressInfo, setStxAddressInfo, setAccountId]);

  const onDisconnect = useCallback(() => {
    (async () => {
      await Wallet.disconnect();
      clearAppData();
    })().catch(console.error);
  }, [clearAppData]);

  useEffect(() => {
    const removeListenerAccountChange = Wallet.addListener('accountChange', (ev) => {
      console.log('The account has changed.', ev);

      // Attempt to get the new account details.
      (async () => {
        const res = await Wallet.request('wallet_getAccount', undefined);

        if (res.status === 'error' && res.error.code === (RpcErrorCode.ACCESS_DENIED as number)) {
          // The app doesn't have permission to read from this account. Clear
          // state and redirect to home page, where the user is prompted to
          // connect.
          clearAppData();
          navigate('/');
          return;
        }

        if (res.status === 'error') {
          console.error('Received unexpected error while getting account details.');
          console.error(res);
          return;
        }

        const btcAddresses = res.result.addresses.filter((a) =>
          [AddressPurpose.Ordinals, AddressPurpose.Payment].includes(a.purpose),
        );
        setBtcAddressInfo(btcAddresses);
        setStxAddressInfo(res.result.addresses.filter((a) => a.purpose === AddressPurpose.Stacks));
        setAccountId(res.result.id);
      })().catch(console.error);
    });

    const removeListenerDisconnect = Wallet.addListener('disconnect', (ev) => {
      console.log('The wallet has been disconnected. Event:', ev);
      clearAppData();
    });

    return () => {
      removeListenerAccountChange();
      removeListenerDisconnect();
    };
  }, [clearAppData, navigate]);

  // On initial load, check if the app has the perms it needs and load necessary
  // data.
  useEffect(() => {
    (async function () {
      const res = await Wallet.request('wallet_getAccount', undefined);

      if (res.status === 'error' && res.error.code === (RpcErrorCode.ACCESS_DENIED as number)) {
        // The app doesn't have permission to read from this account. Clear
        // state and redirect to home page, where the user is prompted to
        // connect.
        clearAppData();
        navigate('/');
        setIsLoading(false);
        return;
      }

      if (res.status === 'error') {
        console.error('Received unexpected error while getting account details.');
        console.error(res);
        setIsLoading(false);
        return;
      }

      const btcAddresses = res.result.addresses.filter((a) =>
        [AddressPurpose.Ordinals, AddressPurpose.Payment].includes(a.purpose),
      );
      setBtcAddressInfo(btcAddresses);
      setStxAddressInfo(res.result.addresses.filter((a) => a.purpose === AddressPurpose.Stacks));
      setAccountId(res.result.id);

      setIsLoading(false);
    })().catch(console.error);
  }, [clearAppData, navigate]);

  const handleLegacyConnectWithGetAccounts = useCallback(() => {
    (async () => {
      const response = await Wallet.request('getAccounts', {
        purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
        message: 'Cool app wants to know your addresses!',
      });
      if (response.status === 'success') {
        setBtcAddressInfo([response.result[0], response.result[1]]);
        if (response.result[2]) setStxAddressInfo([response.result[2]]);
      }
    })().catch(console.error);
  }, [setBtcAddressInfo, setStxAddressInfo]);

  const handleLegacyConnectWithRequestPermissions = useCallback(() => {
    (async () => {
      const res = await Wallet.request('wallet_requestPermissions', undefined);
      if (res.status === 'error') {
        console.error('Error connecting to wallet, details in terminal.');
        console.error(res);
        return;
      }
      const res2 = await Wallet.request('getAddresses', {
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
      });
      if (res2.status === 'error') {
        console.error('Error retrieving bitcoin addresses after having requested permissions.');
        console.error(res2);
        return;
      }
      setBtcAddressInfo(res2.result.addresses);
      const res3 = await Wallet.request('stx_getAddresses', null);
      if (res3.status === 'error') {
        alert(
          'Error retrieving stacks addresses after having requested permissions. Details in terminal.',
        );
        console.error(res3);
        return;
      }
      setStxAddressInfo(res3.result.addresses);
    })().catch(console.error);
  }, [setBtcAddressInfo, setStxAddressInfo]);

  const handleConnect = useCallback(() => {
    (async () => {
      const res = await Wallet.request('wallet_connect', {
        message: 'Cool app wants to know your addresses!',
        addresses: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
      });
      if (res.status === 'error') {
        console.error('Error connecting to wallet, details in terminal.');
        console.error(res);
        return;
      }
      const btcAddresses = res.result.addresses.filter((a) =>
        [AddressPurpose.Ordinals, AddressPurpose.Payment].includes(a.purpose),
      );
      setBtcAddressInfo(btcAddresses);
      setStxAddressInfo(res.result.addresses.filter((a) => a.purpose === AddressPurpose.Stacks));
      setAccountId(res.result.id);
    })().catch(console.error);
  }, [setBtcAddressInfo, setStxAddressInfo]);

  const connectionContextValue = useMemo(
    () => ({ network, btcAddressInfo, stxAddressInfo, onDisconnect, accountId }),
    [network, btcAddressInfo, stxAddressInfo, onDisconnect, accountId],
  );

  if (isLoading) return <div>Loading...</div>;

  if (!isConnected && !isWhiteListedPath) {
    return (
      <Container>
        <Header>
          <Logo src="/sats-connect.svg" alt="SatsConnect" />
          <NetworkSelector network={network} setNetwork={setNetwork} />
          <p>Click the button to connect your wallet</p>
          <ConnectButtonsContainer>
            <Button onClick={handleConnect}>Connect</Button>
            <Button onClick={handleLegacyConnectWithRequestPermissions}>
              wallet_requestPermissions
            </Button>
            <Button onClick={handleLegacyConnectWithGetAccounts}>
              Connect (Legacy getAccounts)
            </Button>
          </ConnectButtonsContainer>
        </Header>
      </Container>
    );
  }

  return (
    <ConnectionContext.Provider value={connectionContextValue}>
      <Stack>{children}</Stack>
    </ConnectionContext.Provider>
  );
}

// TODO move to pages or routes.tsx
const WalletMethods = () => {
  const { network, btcAddressInfo, stxAddressInfo, onDisconnect, accountId } =
    useConnectionContext();

  if (!accountId) return <div>Error: no account ID set.</div>;

  return (
    <>
      <div>
        <Logo src="/sats-connect.svg" alt="SatsConnect" />
      </div>
      <AddressDisplay
        accountId={accountId}
        network={network}
        addresses={[...btcAddressInfo, ...stxAddressInfo]}
        onDisconnect={onDisconnect}
      />
      <GetAddresses />
      <WalletType />
      <GetPermissions />
      <GetAccounts />
    </>
  );
};

const BitcoinMethods = () => {
  const { network, btcAddressInfo, onDisconnect, accountId } = useConnectionContext();

  if (!accountId) return <div>Error: no account ID set.</div>;

  return (
    <>
      <AddressDisplay
        accountId={accountId}
        network={network}
        addresses={[...btcAddressInfo]}
        onDisconnect={onDisconnect}
      />
      <SignMessage addresses={[...btcAddressInfo]} />
      <SendBtc network={network} />
      <SendInscription network={network} />
      <TransferRunes network={network} />
      <GetBtcBalance />
      <GetRunesBalance />
      <GetInscriptions />
      <MintRunes network={network} addresses={[...btcAddressInfo]} />
      <EtchRunes network={network} addresses={[...btcAddressInfo]} />
    </>
  );
};

const StacksMethods = () => {
  const { network, stxAddressInfo, onDisconnect, accountId } = useConnectionContext();

  if (!accountId) return <div>Error: no account ID set.</div>;

  return (
    <>
      <AddressDisplay
        accountId={accountId}
        network={network}
        addresses={[...stxAddressInfo]}
        onDisconnect={onDisconnect}
      />
      <SendStx network={network} />
      <SendSip10 network={network} stxAddressInfo={stxAddressInfo} />
      {stxAddressInfo?.[0]?.publicKey ? (
        <SignTransaction network={network} publicKey={stxAddressInfo?.[0].publicKey} />
      ) : null}
    </>
  );
};

const Layout = () => (
  <CollapseDesktop>
    <AppWithProviders>
      <Outlet />
    </AppWithProviders>
  </CollapseDesktop>
);

const NoMatch = () => (
  <div>
    <h2>Nothing to see here!</h2>
    <p>
      <Link to="/">Go to the home page</Link>
    </p>
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<WalletMethods />} />
      <Route path="bitcoin-methods" element={<BitcoinMethods />} />
      <Route path="stacks-methods" element={<StacksMethods />} />
      <Route path="mobile-universal-link" element={<MobileUniversalLink />} />
      <Route path="*" element={<NoMatch />} />
    </Route>,
  ),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const theme = createTheme({
  primaryColor: 'orange',
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <RouterProvider router={router} />
      </MantineProvider>
    </QueryClientProvider>
  );
}
