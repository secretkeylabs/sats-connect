import type { Json } from 'jsontokens';
import { createUnsecuredToken } from 'jsontokens';
import { getProviderOrThrow } from '../provider';
import type { SignMultipleTransactionOptions } from './types';

export const signMultipleTransactions = async (options: SignMultipleTransactionOptions) => {
  const provider = await getProviderOrThrow(options.getProvider);

  const { psbts } = options.payload;
  if (!psbts || !psbts.length) {
    throw new Error('psbts array is required');
  }
  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const response = await provider.signMultipleTransactions(request);
    options.onFinish?.(response);
  } catch (error) {
    console.error('[Connect] Error during sign Multiple transactions request', error);
    options.onCancel?.();
  }
};
