import { getProviderOrThrow } from '../provider';
import { CreateRepeatInscriptionsOptions } from './types';
import { Json, createUnsecuredToken } from 'jsontokens';
import { validateInscriptionPayload } from './utils';

export const createRepeatInscriptions = async (options: CreateRepeatInscriptionsOptions) => {
  const { getProvider } = options;
  const provider = await getProviderOrThrow(getProvider);

  validateInscriptionPayload(options.payload);

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const response = await provider.createRepeatInscriptions(request);
    options.onFinish?.(response);
  } catch (error) {
    console.error('[Connect] Error during create repeat inscriptions', error);
    options.onCancel?.();
  }
};
