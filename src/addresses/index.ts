import type { Json } from 'jsontokens';
import { createUnsecuredToken } from 'jsontokens';

import { getProviderOrThrow } from '../provider';
import type { GetAddressOptions } from './types';

export const getAddress = async (options: GetAddressOptions) => {
  const provider = await getProviderOrThrow(options.getProvider);

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
