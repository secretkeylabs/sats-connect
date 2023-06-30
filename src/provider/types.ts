import type { GetAddressResponse } from '../addresses';
import type { CallWalletResponse } from '../call';
import type { SignMessageResponse } from '../messages';
import type { SendTransactionResponse, SignTransactionResponse } from '../transactions';

export interface BitcoinProvider {
  call: (request: string) => Promise<CallWalletResponse>;
  connect: (request: string) => Promise<GetAddressResponse>;
  signMessage: (request: string) => Promise<SignMessageResponse>;
  signTransaction: (request: string) => Promise<SignTransactionResponse>;
  sendTransaction: (request: string) => Promise<SendTransactionResponse>;
}

declare global {
  interface Window {
    BitcoinProvider?: BitcoinProvider;
  }
}
