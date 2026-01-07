import { OpenReceiveParams, request } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

interface Props {
  address: string;
}

export const WalletOpenReceive = ({ address }: Props) => {
  const options = { address };

  const handleWalletGetAccount = () => {
    const handler = async () => {
      const res = await request('wallet_openReceive', options);

      if (res.status === 'error') {
        alert(`Error: ${res.error.message}`);
        console.error('wallet_openReceive error', res.error);
        return;
      }
    };
    handler().catch(console.error);
  };

  return (
    <MethodLayout<OpenReceiveParams>
      method="wallet_openReceive"
      docsUrl="https://docs.xverse.app/sats-connect/wallet-methods/wallet_openreceive"
      options={options}
      handleRequest={handleWalletGetAccount}
      response={null}
    />
  );
};
export default WalletOpenReceive;
