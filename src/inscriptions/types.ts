import type { RequestOptions, RequestPayload } from '../types';

type CreateInscriptionResponse = {
  txId: string;
};

export interface CreateTextInscriptionPayload extends RequestPayload {
  text: string;
  contentType: string;
}
export type CreateTextInscriptionResponse = CreateInscriptionResponse;
export type CreateTextInscriptionOptions = RequestOptions<
  CreateTextInscriptionPayload,
  CreateTextInscriptionResponse
>;

export interface CreateBinaryInscriptionPayload extends RequestPayload {
  dataBase64: string;
  contentType: string;
}
export type CreateBinaryInscriptionResponse = CreateInscriptionResponse;
export type CreateBinaryInscriptionOptions = RequestOptions<
  CreateBinaryInscriptionPayload,
  CreateBinaryInscriptionResponse
>;
