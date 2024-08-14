import { Container, createTheme, MantineProvider, Stack } from '@mantine/core';
import '@mantine/core/styles.css';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Link,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';
import Wallet, { AddressPurpose, BitcoinNetworkType, type Address } from 'sats-connect';
import { Button, ConnectButtonsContainer, Header, Logo } from './App.styles';
import { GetAccounts } from './components/bitcoin/GetAccounts';
import { GetBtcBalance } from './components/bitcoin/GetBtcBalance';
import { SignMessage } from './components/bitcoin/SignMessage';
import { GetInscriptions } from './components/GetInscriptions';
import { GetRunesBalance } from './components/GetRunesBalance';
import { SendInscription } from './components/sendInscriptions';
import SignTransaction from './components/signTransaction';

import AddressDisplay from './components/AddressDisplay';
import { SendBtc } from './components/bitcoin/SendBtc';
import EtchRunes from './components/EtchRunes';
import MintRunes from './components/MintRunes';
import { NetworkSelector } from './components/NetworkSelector';
import { SendSip10 } from './components/stacks/SendSip10';
import { SendStx } from './components/stacks/SendStx';
import { WalletType } from './components/wallet/WalletType';
import { useLocalStorage } from './hooks';
import { CollapseDesktop } from './layouts/CollapseDesktop';

const ConnectionContext = createContext<{
  network: BitcoinNetworkType;
  legacyAddressInfo: Address[];
  btcAddressInfo: Address[];
  stxAddressInfo: Address[];
  onDisconnect: () => void;
}>({
  network: BitcoinNetworkType.Mainnet,
  legacyAddressInfo: [],
  btcAddressInfo: [],
  stxAddressInfo: [],
  onDisconnect: () => {
    console.log('onDisconnect not implemented');
  },
});

const useConnectionContext = () => useContext(ConnectionContext);

function AppWithProviders({ children }: React.PropsWithChildren<{}>) {
  const queryClient = useQueryClient();
  const [network, setNetwork] = useLocalStorage<BitcoinNetworkType>(
    'network',
    BitcoinNetworkType.Mainnet,
  );
  const [btcAddressInfo, setBtcAddressInfo] = useLocalStorage<Address[]>('btc-addresses', []);
  const [stxAddressInfo, setStxAddressInfo] = useLocalStorage<Address[]>('stx-addresses', []);
  const [legacyAddressInfo, setLegacyAddressInfo] = useLocalStorage<Address[]>(
    'legacy-addresses',
    [],
  );

  const isConnected = btcAddressInfo.length + stxAddressInfo.length + legacyAddressInfo.length > 0;

  useEffect(() => {
    if (btcAddressInfo.length < 1) return;

    const removeListener = Wallet.addListener('accountChange', (ev) => {
      console.log('The account has changed.', ev);
    });

    return removeListener;
  });

  const onConnectLegacy = useCallback(() => {
    (async () => {
      const response = await Wallet.request('getAccounts', {
        purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
        message: 'Cool app wants to know your addresses!',
      });
      if (response.status === 'success') {
        setLegacyAddressInfo(response.result);
      }
    })().catch(console.error);
  }, [setLegacyAddressInfo]);

  const onConnect = useCallback(() => {
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

  const onDisconnect = useCallback(() => {
    (async () => {
      await Wallet.disconnect();
      setBtcAddressInfo([]);
      setStxAddressInfo([]);
      queryClient.clear();
    })().catch(console.error);
  }, [queryClient, setBtcAddressInfo, setStxAddressInfo]);

  const connectionContextValue = useMemo(
    () => ({ network, legacyAddressInfo, btcAddressInfo, stxAddressInfo, onDisconnect }),
    [network, legacyAddressInfo, btcAddressInfo, stxAddressInfo, onDisconnect],
  );

  if (!isConnected) {
    return (
      <Container>
        <Header>
          <Logo src="/sats-connect.svg" alt="SatsConnect" />
          <NetworkSelector network={network} setNetwork={setNetwork} />
          <p>Click the button to connect your wallet</p>
          <ConnectButtonsContainer>
            <Button onClick={onConnect}>Connect Account</Button>
            <Button onClick={onConnectLegacy}>Connect (Legacy)</Button>
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
  const { network, btcAddressInfo, legacyAddressInfo, stxAddressInfo, onDisconnect } =
    useConnectionContext();
  return (
    <>
      <div>
        <Logo src="/sats-connect.svg" alt="SatsConnect" />
      </div>
      <AddressDisplay
        network={network}
        addresses={[...legacyAddressInfo, ...btcAddressInfo, ...stxAddressInfo]}
        onDisconnect={onDisconnect}
      />
      <GetAccounts />
      <WalletType />
    </>
  );
};

const BitcoinMethods = () => {
  const { network, btcAddressInfo, legacyAddressInfo, onDisconnect } = useConnectionContext();
  return (
    <>
      <AddressDisplay
        network={network}
        addresses={[...legacyAddressInfo, ...btcAddressInfo]}
        onDisconnect={onDisconnect}
      />
      <SignMessage addresses={[...btcAddressInfo, ...legacyAddressInfo]} />
      <SendBtc network={network} />
      <SendInscription network={network} />
      <GetBtcBalance />
      <MintRunes network={network} addresses={[...btcAddressInfo, ...legacyAddressInfo]} />
      <EtchRunes network={network} addresses={[...btcAddressInfo, ...legacyAddressInfo]} />
      <GetRunesBalance />
      <GetInscriptions />
    </>
  );
};

const StacksMethods = () => {
  const { network, stxAddressInfo, onDisconnect } = useConnectionContext();
  return (
    <>
      <AddressDisplay
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
      <Route path="*" element={<NoMatch />} />
    </Route>,
  ),
);

const queryClient = new QueryClient();

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
