import type { Json } from 'jsontokens';
import { createUnsecuredToken } from 'jsontokens';

import { getProviderOrThrow } from '../provider';
import type { SignMessageOptions } from './types';

export const signMessage = async (options: SignMessageOptions) => {
  const provider = await getProviderOrThrow(options.getProvider);

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
