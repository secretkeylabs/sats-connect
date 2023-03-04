import { GetAddressResponse } from '../address';

export enum AddressPurposes {
  PAYMENT = 'payment',
  ORDINALS = 'ordinals',
}

export interface Purpose {
  derivation_path?: string;
  purpose: AddressPurposes;
}

export interface BitcoinNetwork {
  type: string;
  address: string;
}

export interface BitcoinProvider {
  getAddress: (
    purpose: Purpose,
    message: string,
    network?: BitcoinNetwork
  ) => Promise<GetAddressResponse>;
  authenticationRequest(payload: string): Promise<string>;
}

declare global {
  interface Window {
    BitcoinProvider?: BitcoinProvider;
  }
}
