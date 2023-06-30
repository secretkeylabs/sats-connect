import { createUnsecuredToken, Json } from 'jsontokens';

import { getDefaultProvider } from '../provider';
import { SignTransactionOptions } from './types';

export const signTransaction = async (options: SignTransactionOptions) => {
  const { getProvider = getDefaultProvider } = options;
  const provider = await getProvider();
  if (!provider) {
    throw new Error('No Bitcoin wallet installed');
  }

  const { psbtBase64, inputsToSign } = options.payload;
  if (!psbtBase64) {
    throw new Error('A value for psbtBase64 representing the tx hash is required');
  }
  if (!inputsToSign) {
    throw new Error('An array specifying the inputs to be signed by the wallet is required');
  }

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const addressResponse = await provider.signTransaction(request);
    options.onFinish?.(addressResponse);
  } catch (error) {
    console.error('[Connect] Error during sign transaction request', error);
    options.onCancel?.();
  }
};
