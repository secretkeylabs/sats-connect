import { SignPsbtResponse } from '../transactions/signPsbt';
import { GetAddressResponse } from '../address';

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
