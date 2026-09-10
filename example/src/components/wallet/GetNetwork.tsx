import { useQuery } from '@tanstack/react-query';
import { request, type WalletGetNetworkParams } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

export function GetNetwork() {
  const options = null;

  const { refetch, data } = useQuery({
    queryKey: ['wallet_getNetwork'],
    queryFn: async () => {
      const res = await request('wallet_getNetwork', options);
      console.log('request("wallet_getCurrentPermissions", options)');
      console.log('options:\n', options);
      console.log('response:\n', res);

      if (res.status === 'error') {
        throw new Error('Error getting wallet network', { cause: res.error });
      }
      return res;
    },
    retry: false,
    enabled: false,
  });

  return (
    <MethodLayout<WalletGetNetworkParams>
      method="wallet_getNetwork"
      docsUrl="https://docs.xverse.app/sats-connect/wallet-methods/wallet_getnetwork"
      options={options}
      handleRequest={() => {
        refetch().catch(console.error);
      }}
      response={JSON.stringify(data, null, 2)}
    />
  );
}
