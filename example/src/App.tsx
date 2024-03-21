import { AddressPurpose, BitcoinNetworkType, getAddress, type Address } from 'sats-connect';
import WalletProvider from 'sats-connect';
import './App.css';
import { AddressDisplay, NetworkSelector, SendBtc, SendStx } from './components';
import { useLocalStorage } from './hooks';

function App() {
  const [network, setNetwork] = useLocalStorage<BitcoinNetworkType>(
    'network',
    BitcoinNetworkType.Mainnet
  );
  const [addressInfo, setAddressInfo] = useLocalStorage<Address[]>('addresses', []);

  const isConnected = addressInfo.length > 0;

  const onConnect = async () => {
    WalletProvider.request('getAccounts', null)
      .then((response) => {
        console.log(response);
      })
      .then((err) => {
        console.log(err);
      });
    // getAddress({
    //   payload: {
    //     purposes: [
    //       AddressPurpose.Stacks,
    //       AddressPurpose.Payment,
    //       AddressPurpose.Ordinals,
    //     ],
    //     message: "My awesome dapp needs your address info",
    //     network: {
    //       type: network,
    //     },
    //   },
    //   onFinish: (response) => {
    //     setAddressInfo(response.addresses);
    //   },
    //   onCancel: () => {
    //     alert("User cancelled the request");
    //   },
    // });
  };

  const onDisconnect = () => {
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
      </div>
    </div>
  );
}

export default App;
