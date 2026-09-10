import { useQuery } from '@tanstack/react-query';
import { WalletGetCurrentPermissionsParams, request } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

export function WalletGetCurrentPermissions() {
  const options = undefined;

  const { refetch, data } = useQuery({
    queryKey: ['wallet_getCurrentPermissions'],
    queryFn: async () => {
      const res = await request('wallet_getCurrentPermissions', options);
      console.log('request("wallet_getCurrentPermissions", options)');
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
    <MethodLayout<WalletGetCurrentPermissionsParams>
      method="wallet_getCurrentPermissions"
      docsUrl="https://docs.xverse.app/sats-connect/xverse-wallet-permissions"
      handleRequest={() => {
        refetch().catch(console.error);
      }}
      response={JSON.stringify(data, null, 2)}
      options={options}
    />
  );
}
