import { RequestOptions, RequestPayload } from '../types';

export enum AddressPurpose {
  Ordinals = 'ordinals',
  Payment = 'payment',
}

export interface GetAddressPayload extends RequestPayload {
  purposes: Array<AddressPurpose>;
  message: string;
}

export interface Address {
  address: string;
  publicKey: string;
  purpose: AddressPurpose;
}

export interface GetAddressResponse {
  addresses: Array<Address>;
}

export type GetAddressOptions = RequestOptions<GetAddressPayload, GetAddressResponse>;
