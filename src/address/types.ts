import { BitcoinNetwork } from '../provider';

export enum AddressPurposes {
  PAYMENT = 'payment',
  ORDINALS = 'ordinals',
}

export interface Purpose {
  derivation_path?: string;
  purpose: AddressPurposes;
}

export interface GetAddressPayload {
  purposes: Array<Purpose>;
  message: string;
  network: BitcoinNetwork;
}

export interface Address {
  address: string;
  publicKey: string;
  purpose: Purpose;
}

export interface GetAddressResponse {
  addresses: Array<Address>
}

export interface GetAddressOptions {
  onFinish: (response: GetAddressResponse) => void;
  onCancel: () => void;
  payload: GetAddressPayload;
}
