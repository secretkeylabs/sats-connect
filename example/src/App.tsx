import Wallet, { type Address, AddressPurpose, BitcoinNetworkType } from 'sats-connect';
import {
  AddressDisplay,
  EtchRunes,
  MintRunes,
  NetworkSelector,
  SendBtc,
  SendStx,
} from './components';
import { useLocalStorage } from './hooks';
import { useCallback, useEffect } from 'react';
import GetBtcBalance from './components/GetBtcBalance';
import GetRunesBalance from './components/GetRunesBalance';
import { Container, ConnectButtonsContainer, Header, Logo, Body, Button } from './App.styles';
import GetInscriptions from './components/GetInscriptions';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { WalletType } from './components/wallet/WalletType';
import { GetAccounts } from './components/bitcoin/GetAccounts';
import { SignMessage } from './components/SignMessage';
import SendInscription from './components/sendInscriptions';
import SignTransaction from './components/signTransaction';

function AppWithProviders() {
  const queryClient = useQueryClient();
  const [network, setNetwork] = useLocalStorage<BitcoinNetworkType>(
    'network',
    BitcoinNetworkType.Mainnet
  );
  const [btcAddressInfo, setBtcAddressInfo] = useLocalStorage<Address[]>('btc-addresses', []);
  const [stxAddressInfo, setStxAddressInfo] = useLocalStorage<Address[]>('stx-addresses', []);

  const isConnected = btcAddressInfo.length + stxAddressInfo.length > 0;

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
        setBtcAddressInfo([response.result[0], response.result[1]]);
        if (response.result[2]) setStxAddressInfo([response.result[2]]);
      }
    })().catch(console.error);
  }, [setBtcAddressInfo, setStxAddressInfo]);

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
          'Error retrieving stacks addresses after having requested permissions. Details in terminal.'
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
    <Container>
      <Body>
        <div>
          <Logo src="/sats-connect.svg" alt="SatsConnect" />
        </div>
        <AddressDisplay
          network={network}
          addresses={[...btcAddressInfo, ...stxAddressInfo]}
          onDisconnect={onDisconnect}
        />
        <GetAccounts />
        <WalletType />
        <SignMessage addresses={btcAddressInfo} />
        <SendStx network={network} />
        {stxAddressInfo?.[0]?.publicKey ? (
          <SignTransaction network={network} publicKey={stxAddressInfo?.[0].publicKey} />
        ) : null}
        <SendBtc network={network} />
        <SendInscription network={network} />
        <GetBtcBalance />
        <MintRunes network={network} addresses={btcAddressInfo} />
        <EtchRunes network={network} addresses={btcAddressInfo} />
        <GetRunesBalance />
        <GetInscriptions />
      </Body>
    </Container>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithProviders />
    </QueryClientProvider>
  );
}
export default App;
