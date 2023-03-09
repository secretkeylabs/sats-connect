import { createUnsecuredToken, Json } from 'jsontokens';
import { BitcoinNetwork } from '../provider';


export interface InputToSign {
  address: string,
  signingIndexes: Array<number>,
  sigHash?: number,
}


export interface SignPsbtPayload {
  network: BitcoinNetwork;
  message: string;
  psbtBase64: string;
  broadcast?: boolean;
  inputsToSign: InputToSign[];
}

export interface SignPsbtOptions {
  payload: SignPsbtPayload;
  onFinish: (response: any) => void;
  onCancel: () => void;
}

export interface SignPsbtResponse {
  psbtBase64: string;
  txId?: string;
}


export const signPsbt = async (options: SignPsbtOptions) => {
  const { psbtBase64 } = options.payload;
  const provider = window.BitcoinProvider;
  if (!provider) {
    throw new Error('No Bitcoin Wallet installed');
  }
  if (!psbtBase64) {
    throw new Error('a value for psbtBase64 representing the tx hash is required');
  }
    try {
      const request = createUnsecuredToken(options.payload as unknown as Json);
      const addressResponse = await provider.signPsbt(request);
      options.onFinish?.(addressResponse);
    } catch (error) {
      console.error('[Connect] Error during signPsbt request', error);
      options.onCancel?.();
    }
};

