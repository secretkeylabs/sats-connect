import { useQuery } from '@tanstack/react-query';
import Wallet, { AddressPurpose } from 'sats-connect';
import styled from 'styled-components';
import { Button, Card } from '../../App.styles';

const ErrorMessage = styled.div({
  color: 'red',
});

export function GetAccounts() {
  const { refetch, error, data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ['getAccounts'],
    queryFn: async () => {
      const res = await Wallet.request('getAccounts', {
        purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
      });
      if (res.status === 'error') {
        throw new Error('Error getting wallet type', { cause: res.error });
      }
      return res.result;
    },
    enabled: false,
  });

  return (
    <Card>
      <h3>[Legacy] Get accounts</h3>

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
