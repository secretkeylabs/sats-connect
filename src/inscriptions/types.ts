import type { RequestOptions, RequestPayload } from '../types';

type CreateInscriptionResponse = {
  txId: string;
};

interface BaseCreateInscriptionPayload extends RequestPayload {
  contentType: string;
  recipientAddress: string;
  inscriptionFee?: number;
  feeAddress?: string;
}

export interface CreateTextInscriptionPayload extends BaseCreateInscriptionPayload {
  text: string;
}
export type CreateTextInscriptionResponse = CreateInscriptionResponse;
export type CreateTextInscriptionOptions = RequestOptions<
  CreateTextInscriptionPayload,
  CreateTextInscriptionResponse
>;

export interface CreateFileInscriptionPayload extends BaseCreateInscriptionPayload {
  dataBase64: string;
}
export type CreateFileInscriptionResponse = CreateInscriptionResponse;
export type CreateFileInscriptionOptions = RequestOptions<
  CreateFileInscriptionPayload,
  CreateFileInscriptionResponse
>;
