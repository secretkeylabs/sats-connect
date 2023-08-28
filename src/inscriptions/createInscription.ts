import type { Json } from 'jsontokens';
import { createUnsecuredToken } from 'jsontokens';

import { getProviderOrThrow } from '../provider';
import { CreateInscriptionOptions, CreateInscriptionPayload } from './types';

const MAX_CONTENT_LENGTH = 400e3; // 400kb is the max miners will mine

export const validateInscriptionPayload = (payload: CreateInscriptionPayload) => {
  const { contentType, content, network, feeAddress, inscriptionFee } = payload;
  if (network.type !== 'Mainnet') {
    throw new Error('Only mainnet is currently supported for inscriptions');
  }

  if (!/^[a-z]+\/[a-z0-9\-\.\+]+(?=;.*|$)/.test(contentType)) {
    throw new Error('Invalid content type detected');
  }

  if (!content || content.length === 0) {
    throw new Error('Empty content not allowed');
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    throw new Error('Content too large');
  }

  if ((feeAddress?.length ?? 0) > 0 && (inscriptionFee ?? 0) <= 0) {
    throw new Error('Invalid combination of fee address and inscription fee provided');
  }
};

export const createInscription = async (options: CreateInscriptionOptions) => {
  const { getProvider } = options;
  const provider = await getProviderOrThrow(getProvider);

  validateInscriptionPayload(options.payload);

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const response = await provider.createInscription(request);
    options.onFinish?.(response);
  } catch (error) {
    console.error('[Connect] Error during create inscription', error);
    options.onCancel?.();
  }
};
