import { useState } from 'react';
import { OpenReceiveParams, request } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

interface Props {
  address: string;
}

export const WalletOpenReceive = ({ address }: Props) => {
  const [response, setResponse] = useState<string | null>(null);
  const options = { address };

  const handleWalletOpenReceive = () => {
    const handler = async () => {
      const res = await request('wallet_openReceive', options);

      if (res.status === 'error') {
        alert(`Error: ${res.error.message}`);
        console.error('wallet_openReceive error', res.error);
        return;
      }

      setResponse(JSON.stringify(res, null, 2));
    };
    handler().catch(console.error);
  };

  return (
    <MethodLayout<OpenReceiveParams>
      method="wallet_openReceive"
      docsUrl="https://docs.xverse.app/sats-connect/wallet-methods/wallet_openreceive"
      options={options}
      handleRequest={handleWalletOpenReceive}
      response={response}
    />
  );
};
export default WalletOpenReceive;
