import Wallet, { type Address, AddressPurpose, BitcoinNetworkType } from 'sats-connect';
import './App.css';
import {
  AddressDisplay,
  EtchRunes,
  MintRunes,
  NetworkSelector,
  SendBtc,
  SendStx,
} from './components';
import { useLocalStorage } from './hooks';
import { useCallback, useState } from 'react';
import GetBtcBalance from './components/GetBtcBalance';
import GetRunesBalance from './components/GetRunesBalance';

function App() {
  const [network, setNetwork] = useLocalStorage<BitcoinNetworkType>(
    'network',
    BitcoinNetworkType.Mainnet
  );
  const [addressInfo, setAddressInfo] = useState<Address[]>([]);

  const isConnected = addressInfo.length > 0;

  const onConnect = async () => {
    const response = await Wallet.request('getAccounts', {
      purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
      message: 'Cool app wants to know your addresses!',
    });
    if (response.status === 'success') {
      setAddressInfo(response.result);
    }
  };

  const onConnect2 = useCallback(async () => {
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

    setAddressInfo((prev) => [...prev, ...res2.result.addresses]);
    const res3 = await Wallet.request('stx_getAddresses', null);

    if (res3.status === 'error') {
      alert(
        'Error retrieving stacks addresses after having requested permissions. Details in terminal.'
      );
      console.error(res3);
      return;
    }

    setAddressInfo((prev) => [...prev, ...res3.result.addresses]);
  }, []);

  const onDisconnect = () => {
    Wallet.disconnect();
    setAddressInfo([]);
  };

  if (!isConnected) {
    return (
      <div className="App">
        <header className="App-header">
          <img className="logo" src="/sats-connect.svg" alt="SatsConnect" />
          <NetworkSelector network={network} setNetwork={setNetwork} />
          <p>Click the button to connect your wallet</p>
          <button onClick={onConnect}>Connect</button>
          <button onClick={onConnect2}>Connect2</button>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="App-body">
        <div>
          <img className="logo" src="/sats-connect.svg" alt="SatsConnect" />
        </div>
        <AddressDisplay network={network} addresses={addressInfo} onDisconnect={onDisconnect} />
        <SendStx network={network} />
        <SendBtc network={network} />
        <GetBtcBalance />
        <MintRunes network={network} addresses={addressInfo} />
        <EtchRunes network={network} addresses={addressInfo} />
        <GetRunesBalance />
      </div>
    </div>
  );
}

export default App;
