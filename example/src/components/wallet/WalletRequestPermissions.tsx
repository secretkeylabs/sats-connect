import { useState } from 'react';
import { request, type RequestPermissionsParams } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

export const WalletRequestPermissions = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [options] = useState<RequestPermissionsParams>([
    {
      type: 'wallet',
      resourceId: 'wallet',
      actions: { readNetwork: true },
    },
  ]);

  const handleWalletRequestPermissions = () => {
    const handler = async () => {
      const method = 'wallet_requestPermissions';
      const res = await request(method, options);
      setResponse(JSON.stringify(res, null, 2));
      console.log('request("wallet_requestPermissions", options)');
      console.log('options:\n', options);
      console.log('response:\n', res);

      if (res.status === 'error') {
        console.error('wallet_requestPermissions error');
        return;
      }
    };
    handler().catch(console.error);
  };

  return (
    <MethodLayout<RequestPermissionsParams>
      method="wallet_requestPermissions"
      docsUrl="https://docs.xverse.app/sats-connect/xverse-wallet-permissions"
      options={options}
      handleRequest={handleWalletRequestPermissions}
      response={response}
    />
  );
  // TODO add form to request different permissions
};
export default WalletRequestPermissions;
