import { createUnsecuredToken, Json } from 'jsontokens';

import { BitcoinNetwork, GetBitcoinProviderFunc, getDefaultProvider } from '../provider';

export interface SendBtcTransactionPayload {
  network: BitcoinNetwork;
  amountSats: string;
  recipientAddress: string;
  message?: string;
}

export interface SendBtcTransactionOptions {
  getProvider?: GetBitcoinProviderFunc;
  onFinish: (response: string) => void;
  onCancel: () => void;
  payload: SendBtcTransactionPayload;
}

export const sendBtcTransaction = async (options: SendBtcTransactionOptions) => {
  const { getProvider = getDefaultProvider } = options;
  const provider = await getProvider();
  if (!provider) {
    throw new Error('No Bitcoin wallet installed');
  }

  const { amountSats, recipientAddress } = options.payload;
  if (!amountSats) {
    throw new Error('An amount to be transferred is required');
  }
  if (!recipientAddress) {
    throw new Error('A recipient address is required');
  }

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const addressResponse = await provider.sendBtcTransaction(request);
    options.onFinish?.(addressResponse);
  } catch (error) {
    console.error('[Connect] Error during send transaction request', error);
    options.onCancel?.();
  }
};
