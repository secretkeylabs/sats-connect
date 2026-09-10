import { useState } from 'react';
import { request, type WalletRenouncePermissionsParams } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

export const WalletRenouncePermissions = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [options] = useState<WalletRenouncePermissionsParams>(undefined);

  const handleWalletRenouncePermissions = () => {
    const handler = async () => {
      const method = 'wallet_renouncePermissions';
      const res = await request(method, options);
      setResponse(JSON.stringify(res, null, 2));
      console.log('request("wallet_renouncePermissions", options)');
      console.log('options:\n', options);
      console.log('response:\n', res);

      if (res.status === 'error') {
        console.error('wallet_renouncePermissions error');
        return;
      }
    };
    handler().catch(console.error);
  };

  return (
    <MethodLayout<WalletRenouncePermissionsParams>
      method="wallet_renouncePermissions"
      docsUrl="https://docs.xverse.app/sats-connect/xverse-wallet-permissions"
      options={options}
      handleRequest={handleWalletRenouncePermissions}
      response={response}
    />
  );
};
export default WalletRenouncePermissions;
