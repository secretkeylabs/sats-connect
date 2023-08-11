import type { Json } from 'jsontokens';
import { createUnsecuredToken } from 'jsontokens';

import { getProviderOrThrow } from '../provider';
import { validateInscriptionPayload } from './common';
import { CreateFileInscriptionOptions } from './types';

export const createFileInscription = async (options: CreateFileInscriptionOptions) => {
  const { getProvider } = options;
  const provider = await getProviderOrThrow(getProvider);

  validateInscriptionPayload(options.payload);

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const response = await provider.createFileInscription(request);
    options.onFinish?.(response);
  } catch (error) {
    console.error('[Connect] Error during address request', error);
    options.onCancel?.();
  }
};
