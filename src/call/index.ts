import { createUnsecuredToken, Json } from 'jsontokens';
import { BitcoinNetwork, BitcoinProvider, getDefaultProvider } from '../provider';

export interface CallWalletPayload {
  method: string;
  network: BitcoinNetwork;
  params?: Array<any>;
}

export interface CallWalletOptions {
  getProvider?: () => Promise<BitcoinProvider>;
  onFinish: (response: Record<string, any>) => void;
  onCancel: () => void;
  payload: CallWalletPayload;
}

export enum CallMethod {
  SIGN_TRANSACTION = 'signTransaction',
  GET_ADDRESS = 'getAddress',
}

export const callWalletPopup = async (options: CallWalletOptions) => {
  const { getProvider = getDefaultProvider } = options;
  const provider = await getProvider();
  if (!provider) {
    throw new Error('No Bitcoin Wallet installed');
  }
  const { method } = options.payload;
  if (!method) {
    throw new Error('A wallet method is required');
  }
  const request = createUnsecuredToken(options.payload as unknown as Json);
  try {
    const callResponse = await provider.call(request);
    options.onFinish?.(callResponse);
  } catch (error) {
    console.error('[Connect] Error during call request', error);
    options.onCancel?.();
  }
};
