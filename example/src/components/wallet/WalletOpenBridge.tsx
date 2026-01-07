import { useState } from 'react';
import { OpenBridgeParams, request } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

export const WalletOpenBridge = () => {
  const [response, setResponse] = useState<string | null>(null);
  const options = {
    from: {
      asset: 'BTC',
      chain: 'bitcoin',
      network: 'mainnet',
    },
    to: {
      asset: 'SparkBTC',
      chain: 'spark',
      network: 'mainnet',
    },
  };

  const handleWalletOpenBridge = () => {
    const handler = async () => {
      const res = await request('wallet_openBridge', options);

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
    <MethodLayout<OpenBridgeParams>
      method="wallet_openBridge"
      docsUrl="https://docs.xverse.app/sats-connect/wallet-methods/wallet_openBridge"
      options={options}
      handleRequest={handleWalletOpenBridge}
      response={response}
    />
  );
};
export default WalletOpenBridge;
