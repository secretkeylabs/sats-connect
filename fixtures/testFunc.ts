import { data } from './testData';
import type { BitcoinProvider } from '../src/provider';
import type { GetAddressResponse } from '../src/addresses';
import type { CallWalletResponse } from '../src/call';
import type { CreateInscriptionResponse } from '../src/inscriptions';
import type { SignMessageResponse } from '../src/messages';
import type { SendBtcTransactionResponse, SignTransactionResponse } from '../src/transactions';

export const mockGetProvider = async (): Promise<BitcoinProvider | undefined> => {
  return {
    call: async (): Promise<CallWalletResponse> => data.callResponse,
    connect: async (): Promise<GetAddressResponse> => data.connectResponse,
    signMessage: async (): Promise<SignMessageResponse> => data.signMessageResponse,
    signTransaction: async (): Promise<SignTransactionResponse> => data.signTransactionResponse,
    sendBtcTransaction: async (): Promise<SendBtcTransactionResponse> =>
      data.sendBtcTransactionResponse,
    createInscription: async (): Promise<CreateInscriptionResponse> =>
      data.createInscriptionResponse,
  };
};
