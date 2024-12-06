import { request } from '@sats-connect/core';
import { poxAddressToTuple } from '@stacks/stacking';
import {
  contractPrincipalCV,
  makeUnsignedContractCall,
  makeUnsignedContractDeploy,
  makeUnsignedSTXTokenTransfer,
  noneCV,
  StacksTransactionWire,
  standardPrincipalCV,
  uintCV,
} from '@stacks/transactions';

const helloWorldContractBody = `
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

export const poxContractAddress = 'SP000000000000000000002Q6VF78';
export const poxContractName = 'pox-4';
export const poolContractAddress = 'SP001SFSMC2ZY76PD4M68P3WGX154XCH7NE3TYMX';
export const poolContractName = 'pox4-pools';
export const poolAdminStacksAddress = 'SPXVRSEH2BKSXAEJ00F1BY562P45D5ERPSKR4Q33';
export const poolAdminPoxAddress = 'bc1qmv2pxw5ahvwsu94kq5f520jgkmljs3af8ly6tr';

export interface MutationFnArgs {
  isPoolAllowContractSelected: boolean;
  isPoolDelegateStacksSelected: boolean;
  isContractDeploySelected: boolean;
  isTokenTransferSelected: boolean;
  broadcast: boolean;
  publicKey: string;
}

function getLastUsedNonce(transactions: StacksTransactionWire[]) {
  const lastTransaction = transactions.at(-1);

  if (!lastTransaction) return undefined;

  return lastTransaction.auth.spendingCondition.nonce + 1n;
}

export async function mutationFunction({
  isPoolAllowContractSelected,
  isPoolDelegateStacksSelected,
  isContractDeploySelected,
  isTokenTransferSelected,
  broadcast,
  publicKey,
}: MutationFnArgs) {
  const transactions: StacksTransactionWire[] = [];

  if (isPoolAllowContractSelected) {
    const transaction = await makeUnsignedContractCall({
      contractAddress: poxContractAddress,
      contractName: poxContractName,
      functionName: 'allow-contract-caller',
      functionArgs: [contractPrincipalCV(poolContractAddress, poolContractName), noneCV()],
      publicKey,
      ...(getLastUsedNonce(transactions) && { nonce: getLastUsedNonce(transactions) }),
    });
    transactions.push(transaction);
  }

  if (isPoolDelegateStacksSelected) {
    const transaction = await makeUnsignedContractCall({
      contractAddress: poolContractAddress,
      contractName: poolContractName,
      functionName: 'delegate-stx',
      functionArgs: [
        uintCV(101_000_000),
        standardPrincipalCV(poolAdminStacksAddress),
        noneCV(),
        noneCV(),
        poxAddressToTuple(poolAdminPoxAddress),
        noneCV(),
      ],
      publicKey,
      ...(getLastUsedNonce(transactions) && { nonce: getLastUsedNonce(transactions) }),
    });
    transactions.push(transaction);
  }

  if (isContractDeploySelected) {
    const now = new Date().getTime();
    const transaction = await makeUnsignedContractDeploy({
      contractName: `hello-world-${now}`,
      codeBody: helloWorldContractBody,
      publicKey,
      ...(getLastUsedNonce(transactions) && { nonce: getLastUsedNonce(transactions) }),
    });
    transactions.push(transaction);
  }

  if (isTokenTransferSelected) {
    const transaction = await makeUnsignedSTXTokenTransfer({
      recipient: 'SP1VYV2JBF1QPNDSKHBZRAWRC4KQXP8ZSSRNKPJE4', // acc 4
      amount: '100000', // 0.1 STX
      publicKey,
      ...(getLastUsedNonce(transactions) && { nonce: getLastUsedNonce(transactions) }),
    });
    transactions.push(transaction);
  }

  const res = await request('stx_signTransactions', {
    transactions: transactions.map((t) => t.serialize()),
    broadcast,
  });

  if (res.status === 'error') {
    throw new Error('Error signing transactions', { cause: res.error });
  }

  return res.result;
}
