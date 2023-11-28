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

export interface CreateRepeatInscriptionsPayload extends CreateInscriptionPayload {
  repeat: number;
}

export type CreateInscriptionResponse = {
  txId: string;
};

export type CreateRepeatInscriptionsResponse = {
  txId: string;
};

export type CreateInscriptionOptions = RequestOptions<
  CreateInscriptionPayload,
  CreateInscriptionResponse
>;

export type CreateRepeatInscriptionsOptions = RequestOptions<
  CreateRepeatInscriptionsPayload,
  CreateRepeatInscriptionsResponse
>;
