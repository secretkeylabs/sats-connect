import { useQuery } from '@tanstack/react-query';
import { request, type StacksAccount } from 'sats-connect';
import { Button, Card } from '../../App.styles';
import { ErrorMessage } from '../common';

function describeAccount(account: StacksAccount) {
  if (account.walletType === 'multisig') {
    return {
      address: account.address,
      walletType: account.walletType,
      hashMode: account.multisig.hashMode,
      threshold: account.multisig.threshold,
      publicKeys: account.multisig.publicKeys,
    };
  }

  return {
    address: account.address,
    walletType: account.walletType ?? 'software',
    publicKey: account.publicKey,
  };
}

export function GetAccounts() {
  const { refetch, error, data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ['stx_getAccounts'],
    queryFn: async () => {
      const res = await request('stx_getAccounts', null);
      if (res.status === 'error') {
        throw new Error('Error getting Stacks accounts', { cause: res.error });
      }
      return res.result;
    },
    enabled: false,
  });

  return (
    <Card>
      <h3>Stacks: Get accounts</h3>
      <p>
        Shows the multisig marker fields (walletType, multisig.hashMode/threshold/publicKeys) for a
        vault account.
      </p>

      <Button
        onClick={() => {
          refetch().catch(console.error);
        }}
      >
        Get accounts
      </Button>

      {(() => {
        if (isFetching) {
          return <p>Loading...</p>;
        }

        if (isError) {
          console.error(error);
          return <ErrorMessage>Error. Check console for details.</ErrorMessage>;
        }

        if (isSuccess) {
          return (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify(data.addresses.map(describeAccount), null, 2)}
            </pre>
          );
        }
      })()}
    </Card>
  );
}
