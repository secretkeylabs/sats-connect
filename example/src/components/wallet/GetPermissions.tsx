import { useQuery } from '@tanstack/react-query';
import Wallet from 'sats-connect';
import styled from 'styled-components';
import { Button, Card } from '../../App.styles';

const ErrorMessage = styled.div({
  color: 'red',
});

export function GetPermissions() {
  const { refetch, error, data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ['wallet_getPermissions'],
    queryFn: async () => {
      const res = await Wallet.request('wallet_getPermissions', undefined);
      if (res.status === 'error') {
        throw new Error('Error getting permissions.', { cause: res.error });
      }
      return res.result;
    },
    enabled: false,
  });

  return (
    <Card>
      <h3>Get permissions</h3>

      <Button
        onClick={() => {
          refetch().catch(console.error);
        }}
      >
        Get permissions
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
          return (
            <div>
              <p>Permissions:</p>
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
