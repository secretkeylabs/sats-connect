import { useCallback, useState } from 'react';
import Wallet, { GetRunesBalanceResult } from 'sats-connect';
import { Button, Card } from '../../App.styles';

export const GetRunesBalance = () => {
  const [balances, setBalances] = useState<GetRunesBalanceResult['balances']>([]);

  const getBalance = useCallback(() => {
    (async () => {
      try {
        const response = await Wallet.request('runes_getBalance', null);
        if (response.status === 'success') {
          setBalances(response.result.balances);
        } else {
          alert('Error getting runes balance. Check console for error logs');
          console.error(response.error);
        }
      } catch (err) {
        console.log(err);
      }
    })().catch(console.error);
  }, []);

  return (
    <Card>
      <h3>Runes Balance</h3>

      <Button onClick={getBalance}>Get Runes Balance</Button>

      <div>
        {(() => {
          if (!balances.length) {
            return <div>No balances</div>;
          }

          return balances.map((balance) => (
            <div key={balance.runeName} style={{ paddingBlockStart: '0.5rem' }}>
              <div>Amount: {balance.amount}</div>
              <div>Divisibility: {balance.divisibility}</div>
              <div>Inscription ID: {balance.inscriptionId}</div>
              <div>Rune name: {balance.runeName}</div>
              <div>Rune symbol: {balance.symbol}</div>
            </div>
          ));
        })()}
      </div>
    </Card>
  );
};
