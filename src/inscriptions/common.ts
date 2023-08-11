import type { CreateFileInscriptionPayload, CreateTextInscriptionPayload } from './types';

export const validateInscriptionPayload = (
  payload: CreateTextInscriptionPayload | CreateFileInscriptionPayload
) => {
  const { contentType, network, recipientAddress, feeAddress, inscriptionFee } = payload;
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

  if (recipientAddress.length === 0) {
    throw new Error('Empty recipient address not allowed');
  }

  if ((feeAddress?.length ?? 0) > 0 && (inscriptionFee ?? 0) <= 0) {
    throw new Error('Invalid combination of fee address and inscription fee provided');
  }
};
