import { Stack, TextInput } from '@mantine/core';
import { useState } from 'react';
import { BitcoinNetworkType, request, type StxTransferStxParams } from 'sats-connect';
import { Success } from '../../../App.styles';
import { MethodLayout } from '../../../layouts/MethodLayout';

interface Props {
  network: BitcoinNetworkType;
}

export const SendStx = ({ network }: Props) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [options, setOptions] = useState<StxTransferStxParams | null>(null);
  const [txnId, setTxnId] = useState('');

  const handleSendStx = () => {
    const handler = async () => {
      const params: StxTransferStxParams = {
        recipient: address,
        amount: +amount,
        memo: memo === '' ? undefined : memo,
      };
      setOptions(params);

      const res = await request('stx_transferStx', params);
      setResponse(JSON.stringify(res, null, 2));

      if (res.status === 'error') {
        console.error(res.error);
        return;
      }

      setTxnId(res.result.txid);
    };
    handler().catch(console.error);
  };

  const explorerUrl =
    network === BitcoinNetworkType.Mainnet
      ? `https://explorer.hiro.so/txid/${txnId}`
      : `https://explorer.hiro.so/txid/${txnId}?chain=testnet`;

  return (
    <MethodLayout<StxTransferStxParams>
      method="stx_transferStx"
      docsUrl="https://docs.xverse.app/sats-connect/stacks-methods/stx_transferstx"
      options={options}
      handleRequest={handleSendStx}
      response={response}
    >
      <Stack>
        <TextInput
          label="Amount (uSTX)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <TextInput
          label="Address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <TextInput
          label="Memo (optional)"
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
        {txnId && (
          <Success>
            Success! Click{' '}
            <a href={explorerUrl} target="_blank" rel="noreferrer">
              here
            </a>{' '}
            to see your transaction
          </Success>
        )}
      </Stack>
    </MethodLayout>
  );
};
