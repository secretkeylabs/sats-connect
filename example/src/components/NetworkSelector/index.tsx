import { BitcoinNetworkType } from 'sats-connect';

type Props = {
  network: BitcoinNetworkType;
  setNetwork: (newNetwork: BitcoinNetworkType) => void;
};

const NetworkSelector = ({ network, setNetwork }: Props) => {
  const onNetworkChange = () => {
    const newNetwork =
      network === BitcoinNetworkType.Mainnet
        ? BitcoinNetworkType.Testnet
        : BitcoinNetworkType.Mainnet;
    setNetwork(newNetwork);
  };

  return (
    <div>
      <p>
        Network: <span className="action">{network}</span>
      </p>
      <div className="networkSelectorButton">
        <button onClick={onNetworkChange}>Change Network</button>
      </div>
    </div>
  );
};

export default NetworkSelector;
