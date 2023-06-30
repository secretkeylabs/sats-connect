import { GetAddressResponse } from '../addresses';
import { SignTransactionResponse } from '../transactions';

export interface BitcoinNetwork {
  type: 'Mainnet' | 'Testnet';
  address?: string;
}

export interface BitcoinProvider {
  call: (request: string) => Promise<Record<string, any>>;
  connect: (request: string) => Promise<GetAddressResponse>;
  signMessage: (request: string) => Promise<string>;
  signTransaction: (request: string) => Promise<SignTransactionResponse>;
  sendTransaction: (request: string) => Promise<string>;
}

declare global {
  interface Window {
    BitcoinProvider?: BitcoinProvider;
  }
}
