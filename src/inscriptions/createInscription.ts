import type { Json } from 'jsontokens';
import { createUnsecuredToken } from 'jsontokens';

import { getProviderOrThrow } from '../provider';
import { CreateInscriptionOptions, CreateInscriptionPayload } from './types';

const MAX_CONTENT_LENGTH_MAINNET = 400e3; // 400kb is the max miners will mine
const MAX_CONTENT_LENGTH_TESTNET = 60e3; // 60kb limit on Testnet to prevent spam

export const validateInscriptionPayload = (payload: CreateInscriptionPayload) => {
  const { contentType, content, payloadType, network, appFeeAddress, appFee } = payload;
  if (!/^[a-z]+\/[a-z0-9\-\.\+]+(?=;.*|$)/.test(contentType)) {
    throw new Error('Invalid content type detected');
  }

  if (!content || content.length === 0) {
    throw new Error('Empty content not allowed');
  }

  if (!payloadType || (payloadType !== 'BASE_64' && payloadType !== 'PLAIN_TEXT')) {
    throw new Error('Empty invalid payloadType specified');
  }

  if (
    content.length >
    (network.type === 'Mainnet' ? MAX_CONTENT_LENGTH_MAINNET : MAX_CONTENT_LENGTH_TESTNET)
  ) {
    throw new Error('Content too large');
  }

  if ((appFeeAddress?.length ?? 0) > 0 && (appFee ?? 0) <= 0) {
    throw new Error('Invalid combination of app fee address and fee provided');
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
