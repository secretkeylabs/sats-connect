import type { Json } from 'jsontokens';
import { createUnsecuredToken } from 'jsontokens';

import { getProviderOrThrow } from '../provider';
import { CreateTextInscriptionOptions } from './types';

export const createTextInscription = async (options: CreateTextInscriptionOptions) => {
  const { getProvider } = options;
  const provider = await getProviderOrThrow(getProvider);

  const { contentType, network, text } = options.payload;
  if (network.type !== 'Mainnet') {
    throw new Error('Only mainnet is currently supported for inscriptions');
  }

  if (!text || text.length === 0) {
    throw new Error('Empty content not allowed');
  }

  if (!/^[a-z]+\/[a-z0-9\-\.\+](?=;.*|$)/.test(contentType)) {
    throw new Error('Invalid content type detected');
  }

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const response = await provider.createTextInscription(request);
    options.onFinish?.(response);
  } catch (error) {
    console.error('[Connect] Error during address request', error);
    options.onCancel?.();
  }
};
