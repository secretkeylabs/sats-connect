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
  connect: (
    purpose: Purpose,
    message: string,
    network?: BitcoinNetwork
  ) => Promise<GetAddressResponse>;
  call: (
    method: string,
    params: Array<any>,
    network: BitcoinNetwork
  ) => Promise<GetAddressResponse> ;
  disconnect: () => void;
}

declare global {
  interface Window {
    BitcoinProvider?: BitcoinProvider;
  }
}
