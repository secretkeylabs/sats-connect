import { createUnsecuredToken, Json } from 'jsontokens';

import { getDefaultProvider } from '../provider';
import { GetAddressOptions } from './types';

export const getAddress = async (options: GetAddressOptions) => {
  const { getProvider = getDefaultProvider } = options;
  const provider = await getProvider();
  if (!provider) {
    throw new Error('No Bitcoin Wallet installed');
  }

  const { purposes } = options.payload;
  if (!purposes) {
    throw new Error('Address purposes are required');
  }

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const addressResponse = await provider.connect(request);
    options.onFinish?.(addressResponse);
  } catch (error) {
    console.error('[Connect] Error during address request', error);
    options.onCancel?.();
  }
};

export * from './types';
