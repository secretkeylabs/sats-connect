import { useCallback, useState } from 'react';
import Wallet, { BitcoinNetworkType } from 'sats-connect';
import { Button, Card, Input, Success } from '../../App.styles';

interface Props {
  network: BitcoinNetworkType;
}

const SendBtc = ({ network }: Props) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [txnId, setTxnId] = useState('');

  const onClick = useCallback(() => {
    (async () => {
      const response = await Wallet.request('sendTransfer', {
        recipients: [
          {
            address: address,
            amount: +amount,
          },
        ],
      });

      if (response.status === 'error') {
        console.error(response.error);
        alert('Error sending BTC. See console for details.');
        return;
      }

      setTxnId(response.result.txid);
      setAmount('');
      setAddress('');
    })().catch(console.error);
  }, [address, amount]);

  const explorerUrl =
    network === BitcoinNetworkType.Mainnet
      ? `https://mempool.space/tx/${txnId}`
      : `https://mempool.space/testnet/tx/${txnId}`;

  return (
    <Card>
      <h3>Send BTC</h3>
      {!txnId && (
        <>
          <div>
            <div>Amount (sats)</div>
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

export default SendBtc;
