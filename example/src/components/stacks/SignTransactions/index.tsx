import { Button, Card, Checkbox, Stack, Switch } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { ErrorMessage } from '../../common';
import { mutationFunction } from './mutationFunction';

export interface Props {
  publicKey: string;
}

function buttonText(isPending: boolean) {
  return isPending ? 'Signing transactions...' : 'Sign transactions';
}

export function SignTransactions({ publicKey }: Props) {
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
        publicKey,
      })
      .then(console.log)
      .catch((error: unknown) => {
        console.error(error);
        if (error instanceof Error) console.error(error.cause);
      });
  }

  return (
    <Card>
      <h3>Sign transactions</h3>
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

        {signTransactionsMutation.isError && !signTransactionsMutation.isPending && (
          <ErrorMessage>Failed to sign transactions. Check console for details.</ErrorMessage>
        )}
      </Stack>
    </Card>
  );
}
