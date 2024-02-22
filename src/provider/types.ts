import { Params, Requests, Return } from 'src/request';
import type { GetAddressResponse } from '../addresses';
import type { GetCapabilitiesResponse } from '../capabilities';
import type { CreateInscriptionResponse, CreateRepeatInscriptionsResponse } from '../inscriptions';
import type { SignMessageResponse } from '../messages';
import type {
  SendBtcTransactionResponse,
  SignMultipleTransactionsResponse,
  SignTransactionResponse,
} from '../transactions';

/*
export const request = async <Method extends keyof Requests>(
  method: Method,
  options: Args<Method>,
  providerId?: string
): Promise<Return<Method>> => {
  */

interface BaseBitcoinProvider {
  request: <Method extends keyof Requests>(
    method: Method,
    options: Params<Method>
  ) => Promise<Return<Method>>;
  listen: (method: string, callback: () => void) => void;
  connect: (request: string) => Promise<GetAddressResponse>;
  signMessage: (request: string) => Promise<SignMessageResponse>;
  signTransaction: (request: string) => Promise<SignTransactionResponse>;
  sendBtcTransaction: (request: string) => Promise<SendBtcTransactionResponse>;
  createInscription: (request: string) => Promise<CreateInscriptionResponse>;
  createRepeatInscriptions: (request: string) => Promise<CreateRepeatInscriptionsResponse>;
  signMultipleTransactions: (request: string) => Promise<SignMultipleTransactionsResponse>;
}

export type Capability = keyof BaseBitcoinProvider;

export interface BitcoinProvider extends BaseBitcoinProvider {
  getCapabilities?: (request: string) => Promise<GetCapabilitiesResponse>;
}

export interface WebbtcProvider {
  id: string;
  name: string;
  icon: string;
  webUrl?: string;
  chromeWebStoreUrl?: string;
  mozillaAddOnsUrl?: string;
  googlePlayStoreUrl?: string;
  iOSAppStoreUrl?: string;
  methods?: string[];
}

declare global {
  interface XverseProviders {
    BitcoinProvider?: BitcoinProvider;
  }
  interface Window {
    BitcoinProvider?: BitcoinProvider;
    XverseProviders?: XverseProviders;
    webbtc_providers: WebbtcProvider[];
  }
}
