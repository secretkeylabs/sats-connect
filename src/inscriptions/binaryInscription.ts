import type { Json } from 'jsontokens';
import { createUnsecuredToken } from 'jsontokens';

import { getProviderOrThrow } from '../provider';
import { CreateBinaryInscriptionOptions } from './types';

export const createBinaryInscription = async (options: CreateBinaryInscriptionOptions) => {
  const { getProvider } = options;
  const provider = await getProviderOrThrow(getProvider);

  const { contentType, network, dataBase64 } = options.payload;
  if (network.type !== 'Mainnet') {
    throw new Error('Only mainnet is currently supported for inscriptions');
  }

  if (!dataBase64 || dataBase64.length === 0) {
    throw new Error('Empty content not allowed');
  }

  if (!/^[a-zA-Z]+\/[a-zA-Z]+/.test(contentType)) {
    throw new Error('Invalid content type detected');
  }

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const response = await provider.createBinaryInscription(request);
    options.onFinish?.(response);
  } catch (error) {
    console.error('[Connect] Error during address request', error);
    options.onCancel?.();
  }
};
