import { createUnsecuredToken, Json } from 'jsontokens';

import { BitcoinNetwork, GetBitcoinProviderFunc, getDefaultProvider } from '../provider';

export interface Recipient {
  address: string;
  amountSats: bigint;
}

export interface SendBtcTransactionPayload {
  network: BitcoinNetwork;
  recipients: Recipient[];
  senderAddress: string;
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

  const { recipients, senderAddress } = options.payload;
  if (!recipients || recipients.length === 0) {
    throw new Error('At least one recipient is required');
  }
  if (!senderAddress) {
    throw new Error('The sender address is required');
  }

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const addressResponse = await provider.sendBtcTransaction(request);
    options.onFinish?.(addressResponse);
  } catch (error) {
    console.error('[Connect] Error during send BTC transaction request', error);
    options.onCancel?.();
  }
};
