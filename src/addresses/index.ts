import type { Json } from 'jsontokens';
import { createUnsecuredToken } from 'jsontokens';

import { getDefaultProvider } from '../provider';
import type { GetAddressOptions } from './types';

export const getAddress = async (options: GetAddressOptions) => {
  const { getProvider = getDefaultProvider } = options;
  const provider = await getProvider();
  if (!provider) {
    throw new Error('No Bitcoin wallet installed');
  }

  const { purposes } = options.payload;
  if (!purposes) {
    throw new Error('Address purposes are required');
  }

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const response = await provider.connect(request);
    options.onFinish?.(response);
  } catch (error) {
    console.error('[Connect] Error during address request', error);
    options.onCancel?.();
  }
};

export * from './types';
