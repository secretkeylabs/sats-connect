import { useQuery } from '@tanstack/react-query';
import Wallet from 'sats-connect';
import styled from 'styled-components';
import { Button, Card } from '../../App.styles';

const ErrorMessage = styled.div({
  color: 'red',
});

export function WalletType() {
  const { refetch, error, data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ['wallet_getWalletType'],
    queryFn: async () => {
      const res = await Wallet.request('wallet_getWalletType', undefined);
      if (res.status === 'error') {
        throw new Error('Error getting wallet type', { cause: res.error });
      }
      return res.result;
    },
    enabled: false,
  });

  return (
    <Card>
      <h3>Wallet type</h3>

      <Button
        onClick={() => {
          refetch().catch(console.error);
        }}
      >
        Get wallet type
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
              <p>Wallet type: {data}</p>
            </div>
          );
        }
      })()}
    </Card>
  );
}
