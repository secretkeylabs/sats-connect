import { request } from 'sats-connect';
import {
  buildStacksTransactionsForAccount,
  type BuildStacksTransactionsForAccountArgs,
} from './buildStacksTransactionsForAccount';

export interface MutationFnArgs extends BuildStacksTransactionsForAccountArgs {
  broadcast: boolean;
}

export async function mutationFunction({ broadcast, ...builderArgs }: MutationFnArgs) {
  const accountsRes = await request('stx_getAccounts', null);

  if (accountsRes.status === 'error') {
    throw new Error('Error getting Stacks accounts', { cause: accountsRes.error });
  }

  const [account] = accountsRes.result.addresses;

  if (!account) {
    throw new Error('No connected Stacks account.');
  }

  const transactions = await buildStacksTransactionsForAccount(account, builderArgs);

  const res = await request('stx_signTransactions', {
    transactions: transactions.map((t) => t.serialize()),
    broadcast,
  });

  if (res.status === 'error') {
    throw new Error('Error signing transactions', { cause: res.error });
  }

  return res.result;
}
