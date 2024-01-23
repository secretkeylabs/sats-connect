import type { RequestOptions, RequestPayload } from '../types';

export enum AddressPurpose {
  Ordinals = 'ordinals',
  Payment = 'payment',
  Stacks = 'stacks',
}

export interface GetAddressPayload extends RequestPayload {
  purposes: AddressPurpose[];
  message: string;
}

export enum AddressType {
  p2pkh = 'p2pkh',
  p2sh = 'p2sh',
  p2wpkh = 'p2wpkh',
  p2wsh = 'p2wsh',
  p2tr = 'p2tr',
  stacks = 'stacks',
}

export interface Address {
  address: string;
  publicKey: string;
  purpose: AddressPurpose;
  addressType?: AddressType;
}

export interface GetAddressResponse {
  addresses: Address[];
}

export type GetAddressOptions = RequestOptions<GetAddressPayload, GetAddressResponse>;
