import {
  makeUnsignedContractCall,
  makeUnsignedContractDeploy,
  makeUnsignedSTXTokenTransfer,
  uintCV,
} from '@stacks/transactions';
import { BitcoinNetworkType, request } from 'sats-connect';
import { code } from './contractCode';
import { bytesToHex } from '@stacks/common';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Button, H4, Card } from '../../App.styles';

interface Props {
  network: BitcoinNetworkType;
  publicKey: string;
}

const errorMessage = 'Error signing transaction. Check console for error logs.';

function SignTransaction(props: Props) {
  const [broadcast, setBroadcast] = useState(true);

  const contractCallMutation = useMutation({
    mutationKey: ['stx_signTransaction', 'contract-call'],
    mutationFn: async () => {
      const transaction = await makeUnsignedContractCall({
        fee: 3000,
        anchorMode: 'onChainOnly',
        contractAddress: 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP',
        contractName: 'pox-fast-pool-v2',
        functionName: 'set-stx-buffer',
        functionArgs: [uintCV(1)],
        publicKey: props.publicKey,
      });

      const response = await request('stx_signTransaction', {
        transaction: bytesToHex(transaction.serialize()),
        broadcast,
      });

      if (response.status === 'error') {
        throw new Error('Error signing transaction', { cause: response.error });
      }

      return response.result;
    },
  });

  const tokenTransferMutation = useMutation({
    mutationKey: ['stx_signTransaction', 'token-transfer'],
    mutationFn: async () => {
      const transaction = await makeUnsignedSTXTokenTransfer({
        anchorMode: 'any',
        fee: 3000,
        recipient: 'SP2FFKDKR122BZWS7GDPFWC0J0FK4WMW5NPQ0Z21M', // account 4
        amount: 1000,
        publicKey: props.publicKey,
      });

      const response = await request('stx_signTransaction', {
        transaction: bytesToHex(transaction.serialize()),
        broadcast,
      });

      if (response.status === 'error') {
        throw new Error('Error signing transaction', { cause: response.error });
      }

      return response.result;
    },
  });

  const contractDeployMutation = useMutation({
    mutationKey: ['stx_signTransaction', 'contract-deploy'],
    mutationFn: async () => {
      const transaction = await makeUnsignedContractDeploy({
        anchorMode: 'any',
        contractName: 'my-contract',
        codeBody: code,
        fee: 3000,
        publicKey: props.publicKey,
      });

      const response = await request('stx_signTransaction', {
        transaction: bytesToHex(transaction.serialize()),
        broadcast,
      });

      if (response.status === 'error') {
        throw new Error('Error signing transaction', { cause: response.error });
      }

      return response.result;
    },
  });

  return (
    <Card>
      <h3>Sign transaction</h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div>
          <label>
            <input type="checkbox" checked={broadcast} onChange={() => setBroadcast(!broadcast)} />
            Broadcast transaction after signing
          </label>
        </div>
        <div>
          <div>
            <Button style={{ width: '20rem' }} onClick={() => contractCallMutation.mutate()}>
              Sign Transaction (contract call)
            </Button>
          </div>
          <div>
            {(() => {
              if (contractCallMutation.isPending) {
                return <p>Loading...</p>;
              }

              if (contractCallMutation.isError) {
                console.error(contractCallMutation.error);
                return <H4>{errorMessage}</H4>;
              }

              if (contractCallMutation.isSuccess) {
                console.log('Signed transaction:', contractCallMutation.data);
                return <p>Transaction signed successfully. Check console for details.</p>;
              }
            })()}
          </div>
        </div>
        <div>
          <div>
            <Button style={{ width: '20rem' }} onClick={() => tokenTransferMutation.mutate()}>
              Sign Transaction (token transfer)
            </Button>
          </div>
          <div>
            {(() => {
              if (tokenTransferMutation.isPending) {
                return <p>Loading...</p>;
              }

              if (tokenTransferMutation.isError) {
                console.error(tokenTransferMutation.error);
                return <H4>{errorMessage}</H4>;
              }

              if (tokenTransferMutation.isSuccess) {
                console.log(tokenTransferMutation.data);
                return <p>Transaction signed successfully. Check console for details.</p>;
              }
            })()}
          </div>
        </div>
        <div>
          <div>
            <Button style={{ width: '20rem' }} onClick={() => contractDeployMutation.mutate()}>
              Sign Transaction (contract deploy)
            </Button>
          </div>
          <div>
            {(() => {
              if (contractDeployMutation.isPending) {
                return <p>Loading...</p>;
              }

              if (contractDeployMutation.isError) {
                console.error(contractDeployMutation.error);
                return <h3>{errorMessage}</h3>;
              }

              if (contractDeployMutation.isSuccess) {
                console.log(contractDeployMutation.data);
                return <p>Transaction signed successfully. Check console for details.</p>;
              }
            })()}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default SignTransaction;
