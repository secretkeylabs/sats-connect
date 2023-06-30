import { BitcoinNetwork, GetBitcoinProviderFunc } from '../provider';

export enum AddressPurposes {
  PAYMENT = 'payment',
  ORDINALS = 'ordinals',
}

export interface GetAddressPayload {
  purposes: Array<AddressPurposes>;
  message: string;
  network: BitcoinNetwork;
}

export interface Address {
  address: string;
  publicKey: string;
  purpose: AddressPurposes;
}

export interface GetAddressResponse {
  addresses: Array<Address>;
}

export interface GetAddressOptions {
  getProvider?: GetBitcoinProviderFunc;
  onFinish: (response: GetAddressResponse) => void;
  onCancel: () => void;
  payload: GetAddressPayload;
}
