import { useQuery } from '@tanstack/react-query';
import { request } from 'sats-connect';
import { Button, Card } from '../../App.styles';
import { ErrorMessage } from '../common';

export function GetInfo() {
  const { refetch, error, data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ['getAccounts'],
    queryFn: async () => {
      const res = await request('getInfo', null);
      if (res.status === 'error') {
        throw new Error('Error getting info', { cause: res.error });
      }
      return res.result;
    },
    enabled: false,
  });

  return (
    <Card>
      <h3>Get info</h3>

      <Button
        onClick={() => {
          refetch().catch(console.error);
        }}
      >
        Get info
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
              <p>Check console for data.</p>
            </div>
          );
        }
      })()}
    </Card>
  );
}
