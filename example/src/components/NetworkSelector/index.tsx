import { BitcoinNetworkType } from 'sats-connect';
import { Action, Button } from '../../App.styles';

interface Props {
  network: BitcoinNetworkType;
  setNetwork: (newNetwork: BitcoinNetworkType) => void;
}

export const NetworkSelector = ({ network, setNetwork }: Props) => {
  const onNetworkChange = () => {
    const newNetwork =
      network === BitcoinNetworkType.Mainnet
        ? BitcoinNetworkType.Testnet
        : network === BitcoinNetworkType.Testnet
        ? BitcoinNetworkType.Signet
        : BitcoinNetworkType.Mainnet;
    setNetwork(newNetwork);
  };

  return (
    <>
      <p>
        Network: <Action>{network}</Action>
      </p>
      <div className="networkSelectorButton">
        <Button onClick={onNetworkChange}>Change Network</Button>
      </div>
    </>
  );
};
