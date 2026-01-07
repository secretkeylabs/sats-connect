import { useState } from 'react';
import { OpenBuyParams, request } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

export const WalletOpenBuy = () => {
  const [response, setResponse] = useState<string | null>(null);
  const options = {
    asset: 'BTC',
    chain: 'bitcoin',
  };

  const handleWalletOpenBuy = () => {
    const handler = async () => {
      const res = await request('wallet_openBuy', options);

      if (res.status === 'error') {
        alert(`Error: ${res.error.message}`);
        console.error('wallet_openBridge error', res.error);
        return;
      }

      setResponse(JSON.stringify(res, null, 2));
    };
    handler().catch(console.error);
  };

  return (
    <MethodLayout<OpenBuyParams>
      method="wallet_openBuy"
      docsUrl="https://docs.xverse.app/sats-connect/wallet-methods/wallet_openBuy"
      options={options}
      handleRequest={handleWalletOpenBuy}
      response={response}
    />
  );
};
export default WalletOpenBuy;
