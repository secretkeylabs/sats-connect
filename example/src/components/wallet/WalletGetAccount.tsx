import { useState } from 'react';
import { request, type WalletGetAccountParams } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

export const WalletGetAccount = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [options] = useState<WalletGetAccountParams>(null);

  const handleWalletGetAccount = () => {
    const handler = async () => {
      const method = 'wallet_getAccount';
      const res = await request(method, options);
      setResponse(JSON.stringify(res, null, 2));
      console.log('request("wallet_getAccount", options)');
      console.log('options:\n', options);
      console.log('response:\n', res);

      if (res.status === 'error') {
        console.error('wallet_getAccount error');
        return;
      }
    };
    handler().catch(console.error);
  };

  return (
    <MethodLayout<WalletGetAccountParams>
      method="wallet_getAccount"
      docsUrl="https://docs.xverse.app/sats-connect/wallet-methods/wallet_getaccount"
      options={options}
      handleRequest={handleWalletGetAccount}
      response={response}
    />
  );
};
export default WalletGetAccount;
