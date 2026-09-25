import type { StacksAccount, StacksMultisigAccount } from '@sats-connect/core';
import {
  AddressHashMode,
  buildStacksTransactionsForAccount,
  deserializeTransaction,
} from '../example/src/components/stacks/SignTransactions/buildStacksTransactionsForAccount';

const legacyAccount: StacksAccount = {
  address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  publicKey: '03' + '11'.repeat(32),
  gaiaHubUrl: 'https://hub.blockstack.org',
  gaiaAppKey: '03' + '11'.repeat(32),
};

const multisigAccount: StacksMultisigAccount = {
  address: 'SN3R2VFF0FQ4EJEDR3B04M4TS6BSJVGXYFVEV21X4',
  walletType: 'multisig',
  multisig: {
    hashMode: 'P2SHNonSequential',
    threshold: 2,
    publicKeys: ['02' + '11'.repeat(32), '02' + '22'.repeat(32), '02' + '33'.repeat(32)],
  },
};

const args = {
  isPoolAllowContractSelected: false,
  isPoolDelegateStacksSelected: false,
  isContractDeploySelected: false,
  isTokenTransferSelected: true,
};

describe('buildStacksTransactionsForAccount', () => {
  it('builds a single-sig transaction for a legacy account', async () => {
    const [transaction] = await buildStacksTransactionsForAccount(legacyAccount, 'mainnet', args);

    expect(transaction.auth.spendingCondition.hashMode).toBe(AddressHashMode.P2PKH);

    const roundTripped = deserializeTransaction(transaction.serialize());
    expect(roundTripped.auth.spendingCondition.hashMode).toBe(AddressHashMode.P2PKH);
  });

  it('stamps the wallet network on the transaction so the signer matches a testnet vault', async () => {
    const [transaction] = await buildStacksTransactionsForAccount(multisigAccount, 'testnet', args);

    // 0x80 is the Stacks testnet transaction version byte.
    expect(transaction.transactionVersion).toBe(0x80);
  });

  it('builds a non-sequential multisig transaction for a vault account', async () => {
    const [transaction] = await buildStacksTransactionsForAccount(multisigAccount, 'mainnet', args);

    const { spendingCondition } = transaction.auth;
    expect(spendingCondition.hashMode).toBe(AddressHashMode.P2SHNonSequential);
    if ('signaturesRequired' in spendingCondition) {
      expect(spendingCondition.signaturesRequired).toBe(multisigAccount.multisig.threshold);
    } else {
      throw new Error('Expected a multisig spending condition.');
    }

    const roundTripped = deserializeTransaction(transaction.serialize());
    expect(roundTripped.auth.spendingCondition.hashMode).toBe(AddressHashMode.P2SHNonSequential);
  });

  it('builds one transaction per selected checkbox, chaining nonces', async () => {
    const transactions = await buildStacksTransactionsForAccount(multisigAccount, 'mainnet', {
      isPoolAllowContractSelected: true,
      isPoolDelegateStacksSelected: false,
      isContractDeploySelected: false,
      isTokenTransferSelected: true,
    });

    expect(transactions).toHaveLength(2);
    expect(transactions[1].auth.spendingCondition.nonce).toBe(
      transactions[0].auth.spendingCondition.nonce + 1n
    );
  });
});
