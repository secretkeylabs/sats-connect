import { createUnsecuredToken, Json } from 'jsontokens';

import { getDefaultProvider } from '../provider';
import { SignMessageOptions } from './types';

export const signMessage = async (options: SignMessageOptions) => {
  const { getProvider = getDefaultProvider } = options;
  const provider = await getProvider();
  if (!provider) {
    throw new Error('No Bitcoin wallet installed');
  }

  const { address, message } = options.payload;
  if (!address) {
    throw new Error('An address is required to sign a message');
  }
  if (!message) {
    throw new Error('A message to be signed is required');
  }

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const response = await provider.signMessage(request);
    options.onFinish?.(response);
  } catch (error) {
    console.error('[Connect] Error during sign message request', error);
    options.onCancel?.();
  }
};

export * from './types';
