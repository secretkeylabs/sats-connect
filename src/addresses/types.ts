import type { RequestOptions, RequestPayload } from '../types';

export enum AddressPurposes {
  Ordinals = 'ordinals',
  Payment = 'payment',
}

export interface GetAddressPayload extends RequestPayload {
  purposes: AddressPurposes[];
  message: string;
}

export interface Address {
  address: string;
  publicKey: string;
  purpose: AddressPurposes;
}

export interface GetAddressResponse {
  addresses: Address[];
}

export type GetAddressOptions = RequestOptions<GetAddressPayload, GetAddressResponse>;
