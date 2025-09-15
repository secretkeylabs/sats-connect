import { useCallback, useState } from 'react';
import { BitcoinNetworkType, request } from 'sats-connect';
import { Button, Card, Input, Success } from '../../../App.styles';

interface Props {
  network: BitcoinNetworkType;
}

export const SparkTransfer = ({ network }: Props) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [txnId, setTxnId] = useState('');

  const onClick = useCallback(() => {
    (async () => {
      const response = await request('spark_transfer', {
        amountSats: amount,
        receiverSparkAddress: address,
      });

      if (response.status === 'error') {
        console.error(response.error);
        alert('Error sending Spark. See console for details.');
        return;
      }

      setTxnId(response.result.id);
      setAmount('');
      setAddress('');
    })().catch(console.error);
  }, [address, amount]);

  const explorerUrl =
    network === BitcoinNetworkType.Mainnet
      ? `https://www.sparkscan.io/tx/${txnId}?network=mainnet`
      : `https://www.sparkscan.io/tx/${txnId}?network=regtest`;

  return (
    <Card>
      <h3>Send BTC on Spark</h3>
      {!txnId && (
        <>
          <div>
            <div>Amount (SATS)</div>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <div>Address</div>
            <Input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <Button onClick={onClick} disabled={!amount || !address}>
            Send
          </Button>
        </>
      )}
      {txnId && (
        <Success>
          Success! Click{' '}
          <a href={explorerUrl} target="_blank" rel="noreferrer">
            here
          </a>{' '}
          to see your transaction
        </Success>
      )}
    </Card>
  );
};
