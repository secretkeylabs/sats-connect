import type { RequestOptions, RequestPayload } from '../types';

export interface SignMessagePayload extends RequestPayload {
  address: string;
  message: string;
}

export type SignMessageResponse = string;

export type SignMessageOptions = RequestOptions<SignMessagePayload, SignMessageResponse>;
