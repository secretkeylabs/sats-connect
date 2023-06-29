import { GetAddressResponse } from '../address';
import { SignTransactionResponse } from '../transactions/signTransaction';

export interface BitcoinNetwork {
  type: 'Mainnet' | 'Testnet';
  address?: string;
}

export interface BitcoinProvider {
  connect: (request: string) => Promise<GetAddressResponse>;
  call: (request: string) => Promise<Record<string, any>>;
  signTransaction: (request: string) => Promise<SignTransactionResponse>;
  signMessage: (request: string) => Promise<string>;
  sendBtcTransaction: (request: string) => Promise<string>;
}

declare global {
  interface Window {
    BitcoinProvider?: BitcoinProvider;
  }
}

export type GetBitcoinProviderFunc = () => Promise<BitcoinProvider | undefined>;

export async function getDefaultProvider(): Promise<BitcoinProvider | undefined> {
  return window.BitcoinProvider;
}
