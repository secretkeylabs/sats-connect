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

export interface CreateBinaryInscriptionPayload extends BaseCreateInscriptionPayload {
  dataBase64: string;
}
export type CreateBinaryInscriptionResponse = CreateInscriptionResponse;
export type CreateBinaryInscriptionOptions = RequestOptions<
  CreateBinaryInscriptionPayload,
  CreateBinaryInscriptionResponse
>;
