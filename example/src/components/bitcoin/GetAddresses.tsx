import { useQuery } from '@tanstack/react-query';
import Wallet, { AddressPurpose } from 'sats-connect';
import styled from 'styled-components';
import { Button, Card } from '../../App.styles';

const ErrorMessage = styled.div({
  color: 'red',
});

export function GetAddresses() {
  const { refetch, error, data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ['getAddresses'],
    queryFn: async () => {
      const res = await Wallet.request('getAddresses', {
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
      <h3>Get addresses</h3>

      <Button
        onClick={() => {
          refetch().catch(console.error);
        }}
      >
        Get addresses
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
