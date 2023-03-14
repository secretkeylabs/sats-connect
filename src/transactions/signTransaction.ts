import { createUnsecuredToken, Json } from 'jsontokens';
import { BitcoinNetwork } from '../provider';


export interface InputToSign {
  address: string,
  signingIndexes: Array<number>,
  sigHash?: number,
}


export interface SignTransactionPayload {
  network: BitcoinNetwork;
  message: string;
  psbtBase64: string;
  broadcast?: boolean;
  inputsToSign: InputToSign[];
}

export interface SignTransactionOptions {
  payload: SignTransactionPayload;
  onFinish: (response: any) => void;
  onCancel: () => void;
}

export interface SignTransactionResponse {
  psbtBase64: string;
  txId?: string;
}


export const signTransaction = async (options: SignTransactionOptions) => {
  const { psbtBase64, inputsToSign } = options.payload;
  const provider = window.BitcoinProvider;
  if (!provider) {
    throw new Error('No Bitcoin Wallet installed');
  }
  if (!psbtBase64) {
    throw new Error('a value for psbtBase64 representing the tx hash is required');
  }
  if (!inputsToSign) {
    throw new Error('an array specifying the inputs to be signed by the wallet is required');
  }
    try {
      const request = createUnsecuredToken(options.payload as unknown as Json);
      const addressResponse = await provider.signTransaction(request);
      options.onFinish?.(addressResponse);
    } catch (error) {
      console.error('[Connect] Error during signPsbt request', error);
      options.onCancel?.();
    }
};

