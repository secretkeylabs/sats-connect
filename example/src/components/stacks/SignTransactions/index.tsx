import { Button, Card, Checkbox, Code, Stack, Switch } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import type { StacksSignTransactionsBroadcastErrorData } from 'sats-connect';
import { ErrorMessage } from '../../common';
import { mutationFunction } from './mutationFunction';

function buttonText(isPending: boolean) {
  return isPending ? 'Signing transactions...' : 'Sign transactions';
}

function isStacksSignTransactionsBroadcastErrorData(
  data: unknown,
): data is StacksSignTransactionsBroadcastErrorData {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as { transactions?: unknown }).transactions)
  );
}

export function SignTransactions() {
  // Checkboxes
  const [isPoolAllowContractSelected, setIsPoolAllowContractSelected] = useState(false);
  const [isPoolDelegateStacksSelected, setIsPoolDelegateStacks] = useState(false);
  const [isContractDeploySelected, setIsContractDeploySelected] = useState(false);
  const [isTokenTransferSelected, setIsTokenTransferSelected] = useState(false);

  const [broadcast, setBroadcast] = useState(false);

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
      })
      .then(console.log)
      .catch((error: unknown) => {
        console.error(error);
        if (error instanceof Error) console.error(error.cause);
      });
  }

  const errorData =
    signTransactionsMutation.error instanceof Error
      ? (signTransactionsMutation.error.cause as { data?: unknown } | undefined)?.data
      : undefined;

  return (
    <Card>
      <h3>Sign transactions</h3>
      <p>
        Reads the connected Stacks account via stx_getAccounts; builds a vault (multisig) batch when
        it is one.
      </p>
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

        <Button onClick={handleSignTransactionsClick} disabled={signTransactionsMutation.isPending}>
          {buttonText(signTransactionsMutation.isPending)}
        </Button>

        {signTransactionsMutation.isSuccess && (
          <>
            <h4>Result</h4>
            <Code block>{JSON.stringify(signTransactionsMutation.data, null, 2)}</Code>
          </>
        )}

        {signTransactionsMutation.isError && !signTransactionsMutation.isPending && (
          <>
            <ErrorMessage>Failed to sign transactions. Check console for details.</ErrorMessage>
            {isStacksSignTransactionsBroadcastErrorData(errorData) && (
              <>
                <h4>Batch stopped partway through — per-transaction status</h4>
                <Code block>{JSON.stringify(errorData.transactions, null, 2)}</Code>
              </>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
}
