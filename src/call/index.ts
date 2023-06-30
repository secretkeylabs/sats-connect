import { createUnsecuredToken, Json } from 'jsontokens';

import { getDefaultProvider } from '../provider';
import { CallWalletOptions } from './types';

export const callWalletPopup = async (options: CallWalletOptions) => {
  const { getProvider = getDefaultProvider } = options;
  const provider = await getProvider();
  if (!provider) {
    throw new Error('No Bitcoin wallet installed');
  }

  const { method } = options.payload;
  if (!method) {
    throw new Error('A wallet method is required');
  }

  const request = createUnsecuredToken(options.payload as unknown as Json);
  try {
    const callResponse = await provider.call(request);
    options.onFinish?.(callResponse);
  } catch (error) {
    console.error('[Connect] Error during call request', error);
    options.onCancel?.();
  }
};

export * from './types';
