import type { Json } from 'jsontokens';
import { createUnsecuredToken } from 'jsontokens';

import { getProviderOrThrow } from '../provider';
import type { CallWalletOptions } from './types';

export const callWalletPopup = async (options: CallWalletOptions) => {
  const provider = await getProviderOrThrow(options.getProvider);

  const { method } = options.payload;
  if (!method) {
    throw new Error('A wallet method is required');
  }

  const request = createUnsecuredToken(options.payload as unknown as Json);
  try {
    const response = await provider.call(request);
    options.onFinish?.(response);
  } catch (error) {
    console.error('[Connect] Error during call request', error);
    options.onCancel?.();
  }
};

export * from './types';
