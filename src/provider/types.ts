import type { GetAddressResponse } from '../addresses';
import type { CallWalletResponse } from '../call';
import type { GetCapabilitiesResponse } from '../capabilities';
import type { CreateFileInscriptionResponse, CreateTextInscriptionResponse } from '../inscriptions';
import type { SignMessageResponse } from '../messages';
import type { SendBtcTransactionResponse, SignTransactionResponse } from '../transactions';

interface BaseBitcoinProvider {
  call: (request: string) => Promise<CallWalletResponse>;
  connect: (request: string) => Promise<GetAddressResponse>;
  signMessage: (request: string) => Promise<SignMessageResponse>;
  signTransaction: (request: string) => Promise<SignTransactionResponse>;
  sendBtcTransaction: (request: string) => Promise<SendBtcTransactionResponse>;
  createTextInscription: (request: string) => Promise<CreateTextInscriptionResponse>;
  createFileInscription: (request: string) => Promise<CreateFileInscriptionResponse>;
}

export type Capability = keyof BaseBitcoinProvider;

export interface BitcoinProvider extends BaseBitcoinProvider {
  getCapabilities: (request: string) => Promise<GetCapabilitiesResponse>;
}

declare global {
  interface Window {
    BitcoinProvider?: BitcoinProvider;
  }
}
