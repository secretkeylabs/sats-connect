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
        ? BitcoinNetworkType.Testnet4
        : network === BitcoinNetworkType.Testnet4
        ? BitcoinNetworkType.Signet
        : network === BitcoinNetworkType.Signet
        ? BitcoinNetworkType.Testnet
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
