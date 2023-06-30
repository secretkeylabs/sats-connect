import { GetAddressResponse } from '../address';
import { SignTransactionResponse } from '../transactions/signTransaction';

export interface BitcoinNetwork {
  type: 'Mainnet' | 'Testnet';
  address?: string;
}

export interface BitcoinProvider {
  call: (request: string) => Promise<Record<string, any>>;
  connect: (request: string) => Promise<GetAddressResponse>;
  sendBtcTransaction: (request: string) => Promise<string>;
  signMessage: (request: string) => Promise<string>;
  signTransaction: (request: string) => Promise<SignTransactionResponse>;
}

declare global {
  interface Window {
    BitcoinProvider?: BitcoinProvider;
  }
}
