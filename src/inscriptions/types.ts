import type { RequestOptions, RequestPayload } from '../types';

export interface CreateInscriptionPayload extends RequestPayload {
  contentType: string;
  content: string;
  payloadType: 'PLAIN_TEXT' | 'BASE_64';
  appFee?: number;
  appFeeAddress?: string;
  suggestedMinerFeeRate?: number;
  token?: string;
}

export type CreateInscriptionResponse = {
  txId: string;
};

export type CreateInscriptionOptions = RequestOptions<
  CreateInscriptionPayload,
  CreateInscriptionResponse
>;
