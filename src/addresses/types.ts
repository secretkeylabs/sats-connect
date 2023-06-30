import { BitcoinNetwork } from '../networks';
import { GetBitcoinProviderFunc } from '../provider';

export enum AddressPurpose {
  Ordinals = 'ordinals',
  Payment = 'payment',
}

export interface GetAddressPayload {
  purposes: Array<AddressPurpose>;
  message: string;
  network: BitcoinNetwork;
}

export interface Address {
  address: string;
  publicKey: string;
  purpose: AddressPurpose;
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
