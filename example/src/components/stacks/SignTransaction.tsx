import { Button, Stack, Switch } from '@mantine/core';
import { BitcoinNetworkType } from '@sats-connect/core';
import {
  PostConditionMode,
  StacksTransactionWire,
  deserializeTransaction,
  makeUnsignedContractCall,
  makeUnsignedContractDeploy,
  makeUnsignedSTXTokenTransfer,
  uintCV,
} from '@stacks/transactions';
import { useState } from 'react';
import { request } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';
import { verifySigHash } from './utils';

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

interface Props {
  network: BitcoinNetworkType; // TODO handle networks
  publicKey: string;
}

type SignTransactionParams = {
  transaction: string;
  broadcast: boolean;
};

export function SignTransaction({ publicKey }: Props) {
  const [broadcast, setBroadcast] = useState(false);
  const [sponsored, setSponsored] = useState(false);
  const [postConditionMode, setPostConditionMode] = useState<PostConditionMode>(
    PostConditionMode.Deny,
  );
  const [response, setResponse] = useState<string | null>(null);
  const [options, setOptions] = useState<SignTransactionParams | null>(null);

  const requestSignTransaction = async (transaction: StacksTransactionWire) => {
    console.log('deserialized request: ', transaction);

    const params: SignTransactionParams = {
      transaction: transaction.serialize(),
      broadcast,
    };
    setOptions(params);

    try {
      const res = await request('stx_signTransaction', params);
      setResponse(JSON.stringify(res, null, 2));
      console.log('response: ', res);

      if (res.status === 'success') {
        console.log('deserialized response: ', deserializeTransaction(res.result.transaction));
        verifySigHash({ txHex: res.result.transaction });
      } else {
        console.error(res.error);
      }
    } catch (error) {
      setResponse(JSON.stringify({ error: String(error) }, null, 2));
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
    <MethodLayout<SignTransactionParams>
      method="stx_signTransaction"
      docsUrl="https://docs.xverse.app/sats-connect/stacks-methods/stx_signtransaction"
      options={options}
      handleRequest={() => {
        // Request is handled by individual button clicks
      }}
      response={response}
      hideButton={true}
    >
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
    </MethodLayout>
  );
}
