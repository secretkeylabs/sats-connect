import { Button, Card, Stack, Switch } from '@mantine/core';
import { BitcoinNetworkType } from '@sats-connect/core';
import {
  PostConditionMode,
  StacksTransactionWire,
  makeUnsignedContractCall,
  makeUnsignedContractDeploy,
  makeUnsignedSTXTokenTransfer,
  uintCV,
} from '@stacks/transactions';
import { useState } from 'react';
import { request } from 'sats-connect';

const codeBody = `
(define-data-var greeting (string-ascii 100) "Hello, World!")

(define-read-only (get-greeting)
  (ok (var-get greeting))
)

(define-public (set-greeting (new-greeting (string-ascii 100)))
  (begin
    (var-set greeting new-greeting)
    (ok new-greeting))
)
`;

const errorMessage = 'Error signing transaction. Check console for error logs.';

const stringifyWithBigIntToString = (obj: any) =>
  JSON.stringify(
    obj,
    (_, value) => (typeof value === 'bigint' ? value.toString() + 'n' : value),
    2,
  );

import { deserializeTransaction } from '@stacks/transactions';

const verifySigHash = ({ txHex }: { txHex: string }) => {
  try {
    const tx = deserializeTransaction(txHex);

    tx.verifyOrigin();
  } catch (error) {
    console.log(error);

    if (String(error).toLowerCase().includes('invalid signature')) {
      console.error('Invalid signature');
    } else if (
      String(error).toLowerCase().includes('signer hash does not equal hash of public key')
    ) {
      console.error('Sign with connected wallet');
    } else {
      console.error('Error verifying signature');
    }
    throw error;
  }
};

interface Props {
  network: BitcoinNetworkType; // TODO handle networks
  publicKey: string;
}

export function SignTransaction({ publicKey }: Props) {
  const [broadcast, setBroadcast] = useState(false);
  const [sponsored, setSponsored] = useState(false);
  const [postConditionMode, setPostConditionMode] = useState<PostConditionMode>(
    PostConditionMode.Deny,
  );

  const requestSignTransaction = async (transaction: StacksTransactionWire) => {
    try {
      console.log('request: ', stringifyWithBigIntToString(transaction));
      const response = await request('stx_signTransaction', {
        transaction: transaction.serialize(),
        broadcast,
      });
      if (response.status === 'success') {
        alert('Success! Check console for result.');
        console.log('response: ', response.result.transaction);
        console.log('deserialized: ', deserializeTransaction(response.result.transaction));
        verifySigHash({ txHex: response.result.transaction });
      } else {
        alert('Error signing transaction. Check console for error logs');
        console.error(response.error);
      }
    } catch (error) {
      alert(errorMessage);
      console.error(error);
    }
  };

  function handleSignTransactionContractCallClick() {
    makeUnsignedContractCall({
      fee: 3000,
      contractAddress: 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP',
      contractName: 'pox-fast-pool-v2',
      functionName: 'set-stx-buffer',
      functionArgs: [uintCV(1)],
      postConditionMode,
      publicKey,
      sponsored,
    })
      .then((transaction) => {
        return requestSignTransaction(transaction);
      })
      .catch(console.error);
  }

  function handleSignTransactionSTXTokenTransferClick() {
    makeUnsignedSTXTokenTransfer({
      fee: 3000,
      recipient: 'SP2FFKDKR122BZWS7GDPFWC0J0FK4WMW5NPQ0Z21M', // account 4
      amount: 1000,
      publicKey,
      sponsored,
    })
      .then((transaction) => {
        return requestSignTransaction(transaction);
      })
      .catch(console.error);
  }

  function handleSignTransactionContractDeployClick() {
    makeUnsignedContractDeploy({
      contractName: 'my-contract',
      codeBody,
      fee: 3000,
      postConditionMode,
      publicKey,
      sponsored,
    })
      .then((transaction) => {
        return requestSignTransaction(transaction);
      })
      .catch(console.error);
  }

  return (
    <Card>
      <h3>Sign transaction</h3>
      <Stack>
        <Switch
          checked={broadcast}
          onChange={() => setBroadcast((prev) => !prev)}
          label={`Broadcast: ${broadcast ? 'True' : 'False'}`}
        />
        <Switch
          checked={postConditionMode === PostConditionMode.Allow}
          onChange={() =>
            setPostConditionMode((prev) =>
              prev === PostConditionMode.Allow ? PostConditionMode.Deny : PostConditionMode.Allow,
            )
          }
          label={`Post condition mode: ${
            postConditionMode === PostConditionMode.Allow ? 'Allow' : 'Deny'
          } `}
        />
        <Switch
          checked={sponsored}
          onChange={() => setSponsored((prev) => !prev)}
          label={`Sponsored: ${sponsored ? 'True' : 'False'}`}
        />
        <Button onClick={handleSignTransactionSTXTokenTransferClick}>
          Sign Transaction (token transfer)
        </Button>
        <Button onClick={handleSignTransactionContractCallClick}>
          Sign Transaction (contract call)
        </Button>
        <Button onClick={handleSignTransactionContractDeployClick}>
          Sign Transaction (contract deploy)
        </Button>
      </Stack>
    </Card>
  );
}
