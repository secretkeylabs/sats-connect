import type { CreateFileInscriptionPayload, CreateTextInscriptionPayload } from './types';

const MAX_CONTENT_LENGTH = 400e3; // 400kb is the max miners will mine

export const validateInscriptionPayload = (
  payload: CreateTextInscriptionPayload | CreateFileInscriptionPayload
) => {
  const { contentType, network, feeAddress, inscriptionFee } = payload;
  if (network.type !== 'Mainnet') {
    throw new Error('Only mainnet is currently supported for inscriptions');
  }

  if (!/^[a-z]+\/[a-z0-9\-\.\+]+(?=;.*|$)/.test(contentType)) {
    throw new Error('Invalid content type detected');
  }

  const { dataBase64 } = payload as Partial<CreateFileInscriptionPayload>;
  const { text } = payload as Partial<CreateTextInscriptionPayload>;

  const content = text || dataBase64;

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
