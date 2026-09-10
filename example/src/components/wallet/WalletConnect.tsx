import { NativeSelect } from '@mantine/core';
import { useState } from 'react';
import {
  AddressPurpose,
  BitcoinNetworkType,
  request,
  type WalletConnectParams,
} from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';
import { useGlobalState } from '../GlobalStateProvider/use-global-state';

type WalletConnectNetwork =
  | BitcoinNetworkType.Mainnet
  | BitcoinNetworkType.Testnet
  | BitcoinNetworkType.Signet;

export const WalletConnect = () => {
  const { syncNetwork } = useGlobalState();
  const [response, setResponse] = useState<string | null>(null);
  const [options, setOptions] = useState<WalletConnectParams>({
    message: 'Optional message displayed on connection popup',
    addresses: [
      AddressPurpose.Payment,
      AddressPurpose.Ordinals,
      AddressPurpose.Stacks,
      AddressPurpose.Spark,
      AddressPurpose.Starknet,
    ],
    network: BitcoinNetworkType.Mainnet,
  });

  const handleWalletConnect = () => {
    const handler = async () => {
      const method = 'wallet_connect';
      const res = await request(method, options);
      setResponse(JSON.stringify(res, null, 2));
      console.log('request("wallet_connect", options)');
      console.log('options:\n', options);
      console.log('response:\n', res);

      if (res.status === 'error') {
        console.error('wallet_connect error');
        return;
      }

      await syncNetwork();
    };
    handler().catch(console.error);
  };

  return (
    <MethodLayout<WalletConnectParams>
      method="wallet_connect"
      docsUrl="https://docs.xverse.app/sats-connect/connecting-to-the-wallet/connect-to-xverse-wallet"
      options={options}
      handleRequest={handleWalletConnect}
      response={response}
    >
      <NativeSelect
        label={'network'}
        data={[BitcoinNetworkType.Mainnet, BitcoinNetworkType.Testnet, BitcoinNetworkType.Signet]}
        onChange={(e) =>
          setOptions((prev) => ({
            ...prev,
            network: e.target.value as WalletConnectNetwork,
          }))
        }
      />
    </MethodLayout>
  );
};
export default WalletConnect;
