import { useCallback } from 'react';
import Wallet from 'sats-connect';
import { Button, Card } from '../../App.styles';

export const GetInscriptions = () => {
  const onClick = useCallback(() => {
    (async () => {
      const response = await Wallet.request('ord_getInscriptions', {
        limit: 100,
        offset: 0,
      });

      if (response.status === 'error') {
        alert('Error getting inscriptions. See console for details.');
        console.error(response.error);
        return;
      }

      console.log('inscriptions', response.result);
      alert('Success. See console for details.');
    })().catch(console.error);
  }, []);

  return (
    <Card>
      <h3>Inscriptions</h3>

      <Button onClick={onClick}>Get wallet inscriptions</Button>
    </Card>
  );
};
