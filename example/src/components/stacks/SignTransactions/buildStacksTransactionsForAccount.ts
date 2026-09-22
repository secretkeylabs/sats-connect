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
import type { StacksAccount } from 'sats-connect';

// Re-exported for the Jest test in `tests/`, which imports this module by
// relative path and would otherwise be unable to resolve `@stacks/transactions`
// from the root package.
export { AddressHashMode, deserializeTransaction } from '@stacks/transactions';

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

export interface BuildStacksTransactionsForAccountArgs {
  isPoolAllowContractSelected: boolean;
  isPoolDelegateStacksSelected: boolean;
  isContractDeploySelected: boolean;
  isTokenTransferSelected: boolean;
}

/**
 * A vault (multisig) account has no `publicKey`; its transactions must be
 * built with `numSignatures`/`publicKeys` instead, using the non-sequential
 * hash mode the wallet reports in `multisig.hashMode`.
 */
function getStacksSignerOptions(account: StacksAccount) {
  if (account.walletType === 'multisig') {
    return {
      numSignatures: account.multisig.threshold,
      publicKeys: account.multisig.publicKeys,
      useNonSequentialMultiSig: true as const,
    };
  }

  return { publicKey: account.publicKey };
}

function getLastUsedNonce(transactions: StacksTransactionWire[]) {
  const lastTransaction = transactions.at(-1);

  if (!lastTransaction) return undefined;

  return lastTransaction.auth.spendingCondition.nonce + 1n;
}

export async function buildStacksTransactionsForAccount(
  account: StacksAccount,
  {
    isPoolAllowContractSelected,
    isPoolDelegateStacksSelected,
    isContractDeploySelected,
    isTokenTransferSelected,
  }: BuildStacksTransactionsForAccountArgs,
): Promise<StacksTransactionWire[]> {
  const signer = getStacksSignerOptions(account);
  const transactions: StacksTransactionWire[] = [];

  if (isPoolAllowContractSelected) {
    const transaction = await makeUnsignedContractCall({
      contractAddress: poxContractAddress,
      contractName: poxContractName,
      functionName: 'allow-contract-caller',
      functionArgs: [contractPrincipalCV(poolContractAddress, poolContractName), noneCV()],
      ...signer,
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
      ...signer,
      ...(getLastUsedNonce(transactions) && { nonce: getLastUsedNonce(transactions) }),
    });
    transactions.push(transaction);
  }

  if (isContractDeploySelected) {
    const now = new Date().getTime();
    const transaction = await makeUnsignedContractDeploy({
      contractName: `hello-world-${now}`,
      codeBody: helloWorldContractBody,
      ...signer,
      ...(getLastUsedNonce(transactions) && { nonce: getLastUsedNonce(transactions) }),
    });
    transactions.push(transaction);
  }

  if (isTokenTransferSelected) {
    const transaction = await makeUnsignedSTXTokenTransfer({
      recipient: 'SP1VYV2JBF1QPNDSKHBZRAWRC4KQXP8ZSSRNKPJE4', // acc 4
      amount: '100000', // 0.1 STX
      ...signer,
      ...(getLastUsedNonce(transactions) && { nonce: getLastUsedNonce(transactions) }),
    });
    transactions.push(transaction);
  }

  return transactions;
}
