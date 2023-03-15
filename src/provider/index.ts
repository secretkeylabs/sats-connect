import { SignTransactionResponse } from '../transactions/signTransaction';
import { GetAddressResponse } from '../address';

export interface BitcoinProvider {
  connect: (request: string) => Promise<GetAddressResponse>;
  call: (request: string) => Promise<Record<string, any>>;
  signTransaction: (request: string) => Promise<SignTransactionResponse>;
}

declare global {
  interface Window {
    BitcoinProvider?: BitcoinProvider;
  }
}
