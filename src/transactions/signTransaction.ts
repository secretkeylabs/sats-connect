import type { Json } from 'jsontokens';
import { createUnsecuredToken } from 'jsontokens';

import { getProviderOrThrow } from '../provider';
import type { SignTransactionOptions } from './types';

export const signTransaction = async (options: SignTransactionOptions) => {
  const provider = await getProviderOrThrow(options.getProvider);

  const { psbtBase64, inputsToSign } = options.payload;
  if (!psbtBase64) {
    throw new Error('A value for psbtBase64 representing the tx hash is required');
  }
  if (!inputsToSign) {
    throw new Error('An array specifying the inputs to be signed by the wallet is required');
  }

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const response = await provider.signTransaction(request);
    options.onFinish?.(response);
  } catch (error) {
    console.error('[Connect] Error during sign transaction request', error);
    options.onCancel?.();
  }
};
