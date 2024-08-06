import { ChangeEventHandler, useState } from 'react';
import Wallet, { BitcoinNetworkType } from 'sats-connect';
import { Button, Card, Input, Success } from '../../../App.styles';

const formInitialState = {
  amount: '',
  contract: '',
  address: '',
  memo: '',
};

const formInputs: {
  field: keyof typeof formInitialState;
  label: string;
  type: 'text' | 'number';
}[] = [
  {
    field: 'contract',
    label: 'Contract',
    type: 'text',
  },
];

export const SendSip10 = ({ network }: { network: BitcoinNetworkType }) => {
  const [form, setForm] = useState(formInitialState);
  const [txnId, setTxnId] = useState('');

  const canSubmit = form.amount && form.address && form.contract;

  const getChangeFormHandler =
    (fieldName: keyof typeof formInitialState): ChangeEventHandler<HTMLInputElement> =>
    (e) => {
      setForm((prevForm) => ({ ...prevForm, [fieldName]: e.target.value }));
    };

  const onClick = () => {
    (async () => {
      const response = await Wallet.request('stx_callContract', {
        contract: 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token', // TODO get from input
        functionName: 'transfer',
        arguments: [
          '100000000',
          'SP2VCZJDTT5TJ7A3QPPJPTEF7A9CD8FRG2BEEJF3D',
          'SP313FW47A0XR7HCBFQ0ZZHS47Q265AEBMPK1GD4N',
        ],
      });

      if (response.status === 'error') {
        console.error(response.error);
        alert('Error sending. See console for details.');
        return;
      }

      setTxnId(response.result.txid);
      setForm(formInitialState);
    })().catch(console.error);
  };

  const explorerUrl =
    network === BitcoinNetworkType.Mainnet
      ? `https://explorer.hiro.so/txid/${txnId}`
      : `https://explorer.hiro.so/txid/${txnId}?chain=testnet`;

  return (
    <Card>
      <h3>Send SIP-10</h3>
      {!txnId && (
        <>
          <ul>
            {formInputs.map(({ field, label, type }) => (
              <li key={field}>
                <label>
                  {label}
                  <Input type={type} value={form[field]} onChange={getChangeFormHandler(field)} />
                </label>
              </li>
            ))}
          </ul>
          <Button onClick={onClick} disabled={!canSubmit}>
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
