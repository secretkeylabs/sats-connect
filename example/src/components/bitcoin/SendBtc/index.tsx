import { useCallback, useState } from 'react';
import Wallet, { BitcoinNetworkType } from 'sats-connect';
import { Button, Card, Input, Success } from '../../../App.styles';

interface Props {
  network: BitcoinNetworkType;
}

interface Recipient {
  address: string;
  amount: string;
}

export const SendBtc = ({ network }: Props) => {
  const [recipients, setRecipients] = useState<Recipient[]>([{ address: '', amount: '' }]);
  const [txnId, setTxnId] = useState('');

  const addRecipient = () => {
    setRecipients([...recipients, { address: '', amount: '' }]);
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const updatedRecipients = [...recipients];
    updatedRecipients[index][field] = value;
    setRecipients(updatedRecipients);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      const updatedRecipients = recipients.filter((_, i) => i !== index);
      setRecipients(updatedRecipients);
    }
  };

  const onClick = useCallback(() => {
    (async () => {
      const response = await Wallet.request('sendTransfer', {
        recipients: recipients.map((r) => ({
          address: r.address,
          amount: +r.amount,
        })),
      });

      if (response.status === 'error') {
        console.error(response.error);
        alert('Error sending BTC. See console for details.');
        return;
      }

      setTxnId(response.result.txid);
      setRecipients([{ address: '', amount: '' }]);
    })().catch(console.error);
  }, [recipients]);

  const explorerUrl =
    network === BitcoinNetworkType.Mainnet
      ? `https://mempool.space/tx/${txnId}`
      : `https://mempool.space/testnet/tx/${txnId}`;

  return (
    <Card>
      <h3>Send BTC</h3>
      {!txnId && (
        <>
          {recipients.map((recipient, index) => (
            <div key={index}>
              {index > 0 && <hr />}
              <h4>Recipient {index + 1}</h4>
              <div>
                <div>Amount (sats)</div>
                <Input
                  type="number"
                  value={recipient.amount}
                  onChange={(e) => updateRecipient(index, 'amount', e.target.value)}
                />
              </div>
              <div>
                <div>Address</div>
                <Input
                  type="text"
                  value={recipient.address}
                  onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                />
              </div>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 16,
              marginBottom: 16,
            }}
          >
            <Button onClick={addRecipient} className="secondary">
              Add Recipient
            </Button>
            {recipients.length > 1 && (
              <Button onClick={() => removeRecipient(recipients.length - 1)} className="secondary">
                Remove Recipient
              </Button>
            )}
          </div>
          <Button onClick={onClick} disabled={recipients.some((r) => !r.amount || !r.address)}>
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
