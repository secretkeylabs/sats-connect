import { NativeSelect } from '@mantine/core';
import { useState } from 'react';
import { AddressPurpose, BitcoinNetworkType, request, type ConnectParams } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

export const WalletConnect = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [options, setOptions] = useState<ConnectParams>({
    message: 'Optional message displayed on connection popup',
    addresses: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
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
    };
    handler().catch(console.error);
  };

  return (
    <MethodLayout<ConnectParams>
      method="wallet_connect"
      docsUrl="https://docs.xverse.app/sats-connect/connecting-to-the-wallet/connect-to-xverse-wallet"
      options={options}
      handleRequest={handleWalletConnect}
      response={response}
    >
      <NativeSelect
        label={'network'}
        data={Object.values(BitcoinNetworkType)}
        onChange={(e) =>
          setOptions((prev) => ({ ...prev, network: e.target.value as BitcoinNetworkType }))
        }
      />
    </MethodLayout>
  );
};
export default WalletConnect;
