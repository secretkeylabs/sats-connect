import { createUnsecuredToken, Json } from 'jsontokens';
import { BitcoinNetwork } from '../provider';

export interface SendBtcTransactionPayload {
  network: BitcoinNetwork;
  satsAmount: string;
  recipientAddress: string
  message: string;
}

export interface SendBtcTransactionOptions {
  payload: SendBtcTransactionPayload;
  onFinish: (response: string) => void;
  onCancel: () => void;
}


export const sendBtcTransaction = async (options: SendBtcTransactionOptions) => {
  const { satsAmount, recipientAddress } = options.payload;
  console.log(satsAmount)
  console.log(recipientAddress)
  const provider = window.BitcoinProvider;
  console.log(provider)
  if (!provider) {
    throw new Error('No Bitcoin Wallet installed');
  }
  if (!satsAmount) {
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

