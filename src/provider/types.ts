import { GetAddressResponse } from '../addresses';
import { CallWalletResponse } from '../call';
import { SignMessageResponse } from '../messages';
import { SendTransactionResponse, SignTransactionResponse } from '../transactions';

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
