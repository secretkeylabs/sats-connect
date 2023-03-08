import { SignPsbtResponse } from '../transactions/signPsbt';
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
  connect: (request: string) => Promise<GetAddressResponse>;
  call: (request: string) => Promise<Record<string, any>>;
  signPsbt: (request: string) => Promise<SignPsbtResponse>;
}

declare global {
  interface Window {
    BitcoinProvider?: BitcoinProvider;
  }
}
