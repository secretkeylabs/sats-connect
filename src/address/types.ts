import { BitcoinNetwork, AppDetails } from '../common/types';

export enum AddressPurposes {
  PAYMENT = 'payment',
  ORDINALS = 'ordinals',
}

export interface Purpose {
  derivation_path?: string;
  purpose: AddressPurposes;
}

export interface GetAddressPayload {
  purposes: Array<AddressPurposes>;
  message: string;
  network: BitcoinNetwork;
  appDetails?: AppDetails;
}

export interface Address {
  address: string;
  publicKey: string;
  purpose: AddressPurposes;
}

export interface GetAddressResponse {
  addresses: Array<Address>
}

export interface GetAddressOptions {
  onFinish: (response: GetAddressResponse) => void;
  onCancel: () => void;
  payload: GetAddressPayload;
}
