import type { Json } from 'jsontokens';
import { createUnsecuredToken } from 'jsontokens';

import { getProviderOrThrow } from '../provider';
import { validateInscriptionPayload } from './common';
import { CreateBinaryInscriptionOptions } from './types';

export const createBinaryInscription = async (options: CreateBinaryInscriptionOptions) => {
  const { getProvider } = options;
  const provider = await getProviderOrThrow(getProvider);

  validateInscriptionPayload(options.payload);

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const response = await provider.createBinaryInscription(request);
    options.onFinish?.(response);
  } catch (error) {
    console.error('[Connect] Error during address request', error);
    options.onCancel?.();
  }
};
