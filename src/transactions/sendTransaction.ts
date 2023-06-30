import { createUnsecuredToken, Json } from 'jsontokens';

import { getDefaultProvider } from '../provider';
import { SendTransactionOptions } from './types';

export const sendTransaction = async (options: SendTransactionOptions) => {
  const { getProvider = getDefaultProvider } = options;
  const provider = await getProvider();
  if (!provider) {
    throw new Error('No Bitcoin wallet installed');
  }

  const { recipients, senderAddress } = options.payload;
  if (!recipients || recipients.length === 0) {
    throw new Error('At least one recipient is required');
  }
  if (!senderAddress) {
    throw new Error('The sender address is required');
  }

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const response = await provider.sendTransaction(request);
    options.onFinish?.(response);
  } catch (error) {
    console.error('[Connect] Error during send BTC transaction request', error);
    options.onCancel?.();
  }
};
