import type { GetAddressResponse } from '../addresses';
import type { CallWalletResponse } from '../call';
import type { CreateInscriptionResponse } from '../inscriptions';
import type { SignMessageResponse } from '../messages';
import type { SendBtcTransactionResponse, SignTransactionResponse } from '../transactions';

export interface BitcoinProvider {
  call: (request: string) => Promise<CallWalletResponse>;
  connect: (request: string) => Promise<GetAddressResponse>;
  signMessage: (request: string) => Promise<SignMessageResponse>;
  signTransaction: (request: string) => Promise<SignTransactionResponse>;
  sendBtcTransaction: (request: string) => Promise<SendBtcTransactionResponse>;
  createInscription: (request: string) => Promise<CreateInscriptionResponse>;
}

declare global {
  interface Window {
    BitcoinProvider?: BitcoinProvider;
  }
}
