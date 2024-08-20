import { useCallback, useState } from 'react';
import Wallet from 'sats-connect';
import { Button, Card } from '../../../App.styles';

export const GetBtcBalance = () => {
  const [confirmed, setConfirmed] = useState('');
  const [unconfirmed, setUnconfirmed] = useState('');
  const [total, setTotal] = useState('');

  const onClick = useCallback(() => {
    (async () => {
      const response = await Wallet.request('getBalance', undefined);

      if (response.status === 'error') {
        console.error(response.error);
        alert('Error getting BTC balance. See console for details.');
        return;
      }

      setConfirmed(response.result.confirmed);
      setUnconfirmed(response.result.unconfirmed);
      setTotal(response.result.total);
    })().catch(console.error);
  }, []);

  return (
    <Card>
      <h3>BTC balance</h3>

      <Button onClick={onClick}>Get BTC balance</Button>

      <div>
        <div>Confirmed: {confirmed}</div>
        <div>Unconfirmed: {unconfirmed}</div>
        <div>Total: {total}</div>
      </div>
    </Card>
  );
};
