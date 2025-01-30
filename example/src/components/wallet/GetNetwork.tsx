import { useQuery } from '@tanstack/react-query';
import Wallet from 'sats-connect';
import { Button, Card } from '../../App.styles';
import { ErrorMessage } from '../common';

export function GetNetwork() {
  const { refetch, error, data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ['wallet_getNetwork'],
    queryFn: async () => {
      const res = await Wallet.request('wallet_getNetwork', null);
      if (res.status === 'error') {
        throw new Error('Error getting wallet network', { cause: res.error });
      }
      return res.result;
    },
    enabled: false,
  });

  return (
    <Card>
      <h3>Get Network</h3>

      <Button
        onClick={() => {
          refetch().catch(console.error);
        }}
      >
        Get network
      </Button>

      {(() => {
        if (isFetching) {
          return <p>Loading...</p>;
        }

        if (isError) {
          console.error(error);
          console.error(error.cause);
          return <ErrorMessage>Error. Check console for details.</ErrorMessage>;
        }

        if (isSuccess) {
          console.log(data);
          return (
            <div>
              <pre>
                <code>{JSON.stringify(data, null, 2)}</code>
              </pre>
            </div>
          );
        }
      })()}
    </Card>
  );
}
