import { createTheme, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Link,
  Outlet,
  Route,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';
import Wallet, { AddressPurpose, request, RpcErrorCode } from 'sats-connect';
import { GetBtcBalance } from './components/bitcoin/GetBtcBalance';
import { SignMessage } from './components/bitcoin/SignMessage';
import { GetInscriptions } from './components/GetInscriptions';
import { GetRunesBalance } from './components/GetRunesBalance';
import { SendInscription } from './components/sendInscriptions';

import AddressDisplay from './components/AddressDisplay';
import { GetInfo } from './components/bitcoin/GetInfo.tsx';
import { SendBtc } from './components/bitcoin/SendBtc';
import ChangeNetwork from './components/ChangeNetwork/index.tsx';
import { Connect } from './components/Connect/index.tsx';
import { CreateInscription } from './components/createInscription/index.tsx';
import EtchRunes from './components/EtchRunes';
import { GlobalStateProvider } from './components/GlobalStateProvider/index.tsx';
import { useGlobalState } from './components/GlobalStateProvider/use-global-state.tsx';
import MintRunes from './components/MintRunes';
import { MobileUniversalLink } from './components/mobile/universalLink.tsx';
import {
  ExecuteFlashnetSwap,
  FlashnetClawbackFunds,
  GetEligibleClawbackTransactions,
  GetFlashnetJwt,
  SignFlashnetSwapIntent,
  SparkGetAddresses,
  SparkGetBalance,
  SparkSignMessage,
  SparkSignStructuredMessage,
  SparkTransfer,
  SparkTransferToken,
} from './components/spark/index.tsx';
import { SendSip10 } from './components/stacks/SendSip10';
import { SendStx } from './components/stacks/SendStx';
import { SignMessageStacks } from './components/stacks/signMessageStacks';
import { SignTransaction } from './components/stacks/SignTransaction.tsx';
import { SignTransactions } from './components/stacks/SignTransactions/index.tsx';
import TransferRunes from './components/transferRunes/index.tsx';
import { AddNetwork } from './components/wallet/AddNetwork.tsx';
import { GetNetwork } from './components/wallet/GetNetwork.tsx';
import WalletConnect from './components/wallet/WalletConnect.tsx';
import WalletDisconnect from './components/wallet/WalletDisconnect.tsx';
import WalletGetAccount from './components/wallet/WalletGetAccount.tsx';
import { WalletGetCurrentPermissions } from './components/wallet/WalletGetCurrentPermissions.tsx';
import WalletRenouncePermissions from './components/wallet/WalletRenouncePermissions.tsx';
import WalletRequestPermissions from './components/wallet/WalletRequestPermissions.tsx';
import { WalletGetWalletType } from './components/wallet/WalletType';
import { CollapseDesktop } from './layouts/CollapseDesktop';

function AppWithProviders({ children }: React.PropsWithChildren) {
  const navigate = useNavigate();

  const {
    clearAppData,
    setBtcAddressInfo,
    setStxAddressInfo,
    setSparkAddressInfo,
    setStarknetAddressInfo,
    setAccountId,
    isConnected,
  } = useGlobalState();

  // Clear data on network change.
  useEffect(() => {
    const removeListenerNetworkChange = Wallet.addListener({
      eventName: 'networkChange',
      cb: (ev) => {
        console.log('The network has changed.', ev);
        clearAppData();
      },
    });

    return () => removeListenerNetworkChange();
  }, [clearAppData]);

  // Attempt to auto-reconnect on account change.
  useEffect(() => {
    const removeListenerAccountChange = Wallet.addListener({
      eventName: 'accountChange',
      cb: (ev) => {
        console.log('The account has changed.', ev);

        // Attempt to get the new account details.
        (async () => {
          const res = await request('wallet_getAccount', undefined);

          if (res.status === 'error' && res.error.code === (RpcErrorCode.ACCESS_DENIED as number)) {
            // The app doesn't have permission to read from this account. Clear
            // state and redirect to home page, where the user is prompted to
            // connect.
            clearAppData();
            navigate('/connect');
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
          setStxAddressInfo(
            res.result.addresses.filter((a) => a.purpose === AddressPurpose.Stacks),
          );
          setSparkAddressInfo(
            res.result.addresses.filter((a) => a.purpose === AddressPurpose.Spark),
          );
          setStarknetAddressInfo(
            res.result.addresses.filter((a) => a.purpose === AddressPurpose.Starknet),
          );
          setAccountId(res.result.id);
        })().catch(console.error);
      },
    });

    return () => {
      removeListenerAccountChange();
    };
  }, [
    clearAppData,
    navigate,
    setAccountId,
    setBtcAddressInfo,
    setSparkAddressInfo,
    setStarknetAddressInfo,
    setStxAddressInfo,
  ]);

  // Go to home screen on disconnect.
  useEffect(() => {
    if (!isConnected) return;

    const removeListenerDisconnect = Wallet.addListener({
      eventName: 'disconnect',
      cb: (ev) => {
        console.log('The wallet has been disconnected. Event:', ev);
        clearAppData();
        navigate('/');
      },
    });

    return () => {
      removeListenerDisconnect();
    };
  }, [clearAppData, isConnected, navigate]);

  // Attempt to connect to the wallet on load.
  useEffect(() => {
    (async function () {
      const res = await request('wallet_getAccount', undefined);

      if (res.status === 'error' && res.error.code === (RpcErrorCode.ACCESS_DENIED as number)) {
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
      setSparkAddressInfo(res.result.addresses.filter((a) => a.purpose === AddressPurpose.Spark));
      setStarknetAddressInfo(
        res.result.addresses.filter((a) => a.purpose === AddressPurpose.Starknet),
      );
      setAccountId(res.result.id);

      navigate('/wallet');
    })().catch(console.error);
  }, [
    navigate,
    setAccountId,
    setBtcAddressInfo,
    setSparkAddressInfo,
    setStarknetAddressInfo,
    setStxAddressInfo,
  ]);

  return children;
}

// TODO move to pages or routes.tsx
const WalletMethods = () => {
  const {
    network,
    btcAddressInfo,
    stxAddressInfo,
    sparkAddressInfo,
    starknetAddressInfo,
    disconnect,
    accountId,
    isConnected,
  } = useGlobalState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected) navigate('/');
  }, [isConnected, navigate]);

  if (!isConnected) return;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AddressDisplay
        accountId={accountId}
        network={network}
        addresses={[
          ...btcAddressInfo,
          ...stxAddressInfo,
          ...sparkAddressInfo,
          ...starknetAddressInfo,
        ]}
        onDisconnect={disconnect}
      />
      <WalletConnect />
      <WalletDisconnect />
      <WalletGetAccount />
      <WalletGetCurrentPermissions />
      <WalletRequestPermissions />
      <WalletRenouncePermissions />
      <WalletGetWalletType />
      <GetNetwork />
      <ChangeNetwork />
      <AddNetwork />
    </div>
  );
};

const BitcoinMethods = () => {
  const { network, btcAddressInfo, disconnect, accountId, isConnected } = useGlobalState();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected) navigate('/');
  }, [isConnected, navigate]);

  if (!isConnected) return;

  return (
    <>
      <AddressDisplay
        accountId={accountId}
        network={network}
        addresses={[...btcAddressInfo]}
        onDisconnect={disconnect}
      />
      <GetInfo />
      <SignMessage addresses={[...btcAddressInfo]} />
      <SendBtc network={network} />
      <SendInscription network={network} />
      <CreateInscription network={network} />
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
  const { network, stxAddressInfo, disconnect, accountId, isConnected } = useGlobalState();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected) navigate('/');
  }, [isConnected, navigate]);

  if (!isConnected) return;

  return (
    <>
      <AddressDisplay
        accountId={accountId}
        network={network}
        addresses={stxAddressInfo}
        onDisconnect={disconnect}
      />
      <SignMessageStacks addresses={stxAddressInfo} />
      <SendStx network={network} />
      <SendSip10 network={network} stxAddressInfo={stxAddressInfo} />
      {stxAddressInfo?.[0]?.publicKey ? (
        <SignTransaction network={network} publicKey={stxAddressInfo?.[0].publicKey} />
      ) : null}
      <SignTransactions publicKey={stxAddressInfo[0].publicKey} />
    </>
  );
};

const SparkMethods = () => {
  const { network, sparkAddressInfo, disconnect, accountId, isConnected } = useGlobalState();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected) navigate('/');
  }, [isConnected, navigate]);

  if (!isConnected) return;

  return (
    <>
      <AddressDisplay
        accountId={accountId}
        network={network}
        addresses={sparkAddressInfo}
        onDisconnect={disconnect}
      />
      <SparkGetBalance />
      <SparkGetAddresses />
      <SparkSignMessage sparkPublicKey={sparkAddressInfo[0].publicKey} />
      <SparkTransfer network={network} />
      <SparkTransferToken network={network} />
      <SparkSignStructuredMessage />
      <GetFlashnetJwt />
      <SignFlashnetSwapIntent />
      <ExecuteFlashnetSwap />
      <GetEligibleClawbackTransactions />
      <FlashnetClawbackFunds network={network} />
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
      <Route index element={<Connect />} />
      <Route path="wallet" element={<WalletMethods />} />
      <Route path="bitcoin-methods" element={<BitcoinMethods />} />
      <Route path="stacks-methods" element={<StacksMethods />} />
      <Route path="spark-methods" element={<SparkMethods />} />
      <Route path="mobile-universal-link" element={<MobileUniversalLink />} />
      <Route path="*" element={<NoMatch />} />
    </Route>,
  ),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Set to false since the client is mostly used to send requests to the
      // wallet, which unlike requests to APIs over the internet, are much more
      // reliable and unlikely to succeed when retried if they have already
      // failed.
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
        <GlobalStateProvider>
          <RouterProvider router={router} />
        </GlobalStateProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}
