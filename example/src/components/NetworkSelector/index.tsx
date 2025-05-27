import { useCallback } from 'react';
import { BitcoinNetworkType } from 'sats-connect';
import { Action, Button } from '../../App.styles';
import { useGlobalState } from '../GlobalStateProvider/use-global-state';

export const NetworkSelector = () => {
  const { setNetwork, network } = useGlobalState();

  const onNetworkChange = useCallback(() => {
    const newNetwork =
      network === BitcoinNetworkType.Mainnet
        ? BitcoinNetworkType.Testnet4
        : network === BitcoinNetworkType.Testnet4
        ? BitcoinNetworkType.Signet
        : network === BitcoinNetworkType.Signet
        ? BitcoinNetworkType.Testnet
        : BitcoinNetworkType.Mainnet;
    setNetwork(newNetwork);
  }, [network, setNetwork]);

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
