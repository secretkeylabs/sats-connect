import { Checkbox, Stack, Switch } from '@mantine/core';
import { deserializeTransaction } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { type StxSignTransactionsParams } from 'sats-connect';
import { MethodLayout } from '../../../layouts/MethodLayout';
import { verifySigHash } from '../utils';
import { mutationFunction } from './mutationFunction';

export interface Props {
  publicKey: string;
}

export function SignTransactions({ publicKey }: Props) {
  // Checkboxes
  const [isPoolAllowContractSelected, setIsPoolAllowContractSelected] = useState(false);
  const [isPoolDelegateStacksSelected, setIsPoolDelegateStacks] = useState(false);
  const [isContractDeploySelected, setIsContractDeploySelected] = useState(false);
  const [isTokenTransferSelected, setIsTokenTransferSelected] = useState(false);

  const [broadcast, setBroadcast] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [options, setOptions] = useState<StxSignTransactionsParams | null>(null);

  const signTransactionsMutation = useMutation({
    mutationFn: mutationFunction,
  });

  function handleSignTransactionsClick() {
    signTransactionsMutation
      .mutateAsync({
        isPoolAllowContractSelected,
        isPoolDelegateStacksSelected,
        isContractDeploySelected,
        isTokenTransferSelected,
        broadcast,
        publicKey,
      })
      .then(({ result, params }) => {
        setOptions(params);
        setResponse(JSON.stringify(result, null, 2));
        console.log('response:\n', result);
        result.transactions.forEach((tx) => {
          verifySigHash({ txHex: tx });
        });
      })
      .catch((error: unknown) => {
        setResponse(JSON.stringify({ error: String(error) }, null, 2));
        console.error(error);
        if (error instanceof Error) console.error(error.cause);
      });
  }

  return (
    <MethodLayout<StxSignTransactionsParams>
      method="stx_signTransactions"
      docsUrl="https://docs.xverse.app/sats-connect/stacks-methods/stx_signtransactions"
      options={options}
      handleRequest={handleSignTransactionsClick}
      response={response}
      error={
        signTransactionsMutation.isError && !signTransactionsMutation.isPending
          ? 'Failed to sign transactions. Check console for details.'
          : undefined
      }
    >
      <Stack>
        <Checkbox
          label="Pool Allow Contract"
          checked={isPoolAllowContractSelected}
          onChange={() => setIsPoolAllowContractSelected(!isPoolAllowContractSelected)}
        />
        <Checkbox
          label="Pool Delegate Stacks"
          checked={isPoolDelegateStacksSelected}
          onChange={() => setIsPoolDelegateStacks(!isPoolDelegateStacksSelected)}
        />
        <Checkbox
          label="Contract Deploy"
          checked={isContractDeploySelected}
          onChange={() => setIsContractDeploySelected(!isContractDeploySelected)}
        />
        <Checkbox
          label="Token Transfer"
          checked={isTokenTransferSelected}
          onChange={() => setIsTokenTransferSelected(!isTokenTransferSelected)}
        />
        <Switch label="Broadcast" checked={broadcast} onChange={() => setBroadcast(!broadcast)} />
      </Stack>
    </MethodLayout>
  );
}
