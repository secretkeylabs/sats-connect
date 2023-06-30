import { RequestOptions, RequestPayload } from '../types';

export interface CallWalletPayload extends RequestPayload {
  method: string;
  params?: Array<any>;
}

export type CallWalletResponse = Record<string, any>;

export type CallWalletOptions = RequestOptions<CallWalletPayload, CallWalletResponse>;
