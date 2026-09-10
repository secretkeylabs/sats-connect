import { useState } from 'react';
import { request, type WalletDisconnectParams } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

export const WalletDisconnect = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [options] = useState<WalletDisconnectParams>(null);

  const handleWalletDisconnect = () => {
    const handler = async () => {
      const method = 'wallet_disconnect';
      const res = await request(method, options);
      setResponse(JSON.stringify(res, null, 2));
      console.log('request("wallet_disconnect", options)');
      console.log('options:\n', options);
      console.log('response:\n', res);

      if (res.status === 'error') {
        console.error('wallet_disconnect error');
        return;
      }
    };
    handler().catch(console.error);
  };

  return (
    <MethodLayout<WalletDisconnectParams>
      method="wallet_disconnect"
      docsUrl="https://docs.xverse.app/sats-connect/connecting-to-the-wallet/disconnect-from-xverse-wallet"
      options={options}
      handleRequest={handleWalletDisconnect}
      response={response}
    />
  );
};
export default WalletDisconnect;
