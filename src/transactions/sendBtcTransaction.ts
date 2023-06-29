import { createUnsecuredToken, Json } from 'jsontokens';
import { BitcoinNetwork, BitcoinProvider, getDefaultProvider } from '../provider';

export interface SendBtcTransactionPayload {
  network: BitcoinNetwork;
  amountSats: string;
  recipientAddress: string;
  message?: string;
}

export interface SendBtcTransactionOptions {
  getProvider?: () => Promise<BitcoinProvider>;
  onFinish: (response: string) => void;
  onCancel: () => void;
  payload: SendBtcTransactionPayload;
}

export const sendBtcTransaction = async (options: SendBtcTransactionOptions) => {
  const { getProvider = getDefaultProvider } = options;
  const provider = await getProvider();
  if (!provider) {
    throw new Error('No Bitcoin Wallet installed');
  }
  const { amountSats, recipientAddress } = options.payload;
  if (!amountSats) {
    throw new Error('a value for amount to be transferred is required');
  }
  if (!recipientAddress) {
    throw new Error('the recipient address is required');
  }
  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const addressResponse = await provider.sendBtcTransaction(request);
    options.onFinish?.(addressResponse);
  } catch (error) {
    console.error('[Connect] Error during send btc request', error);
    options.onCancel?.();
  }
};
