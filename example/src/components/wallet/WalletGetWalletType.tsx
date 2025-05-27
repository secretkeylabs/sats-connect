import { useQuery } from '@tanstack/react-query';
import { request, type GetWalletTypeParams } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

export function WalletGetWalletType() {
  const options = undefined;
  const { refetch, data } = useQuery({
    queryKey: ['wallet_getWalletType'],
    queryFn: async () => {
      const res = await request('wallet_getWalletType', options);
      console.log('request("wallet_getWalletType", options)');
      console.log('options:\n', options);
      console.log('response:\n', res);

      if (res.status === 'error') {
        console.error('wallet_getCurrentPermissions error');
      }
      return res;
    },
    retry: false,
    enabled: false,
  });

  return (
    <MethodLayout<GetWalletTypeParams>
      method="wallet_getWalletType"
      handleRequest={() => {
        refetch().catch(console.error);
      }}
      response={JSON.stringify(data, null, 2)}
    />
  );
}
