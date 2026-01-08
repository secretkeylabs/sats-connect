import { NativeSelect } from '@mantine/core';
import { useState } from 'react';
import { OpenBridgeParams, request } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

const supportedTokens = ['BTC', 'sBTC', 'WBTC', 'STRK', 'SparkBTC'];

export const WalletOpenBridge = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [fromAsset, setFromAsset] = useState<string>('BTC');
  const [toAsset, setToAsset] = useState<string>('SparkBTC');

  const options = {
    fromAsset,
    toAsset,
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
    >
      <div>From</div>
      <NativeSelect
        defaultValue={fromAsset}
        data={supportedTokens}
        onChange={(e) => setFromAsset(e.target.value)}
      />
      <div>To</div>
      <NativeSelect
        defaultValue={toAsset}
        data={supportedTokens}
        onChange={(e) => setToAsset(e.target.value)}
      />
    </MethodLayout>
  );
};
export default WalletOpenBridge;
