import { createUnsecuredToken, Json } from 'jsontokens';
import { BitcoinNetwork } from '../provider';

export interface Recipient {
  address: string;
  amountSats: number;
}

export interface SendBtcTransactionPayload {
  network: BitcoinNetwork;
  recipients: Recipient[]
  senderAddress: string;
  message?: string;
}

export interface SendBtcTransactionOptions {
  payload: SendBtcTransactionPayload;
  onFinish: (response: string) => void;
  onCancel: () => void;
}


export const sendBtcTransaction = async (options: SendBtcTransactionOptions) => {
  const { recipients, senderAddress  } = options.payload;
  const provider = window.BitcoinProvider;

  if (!provider) {
    throw new Error('No Bitcoin Wallet installed');
  }
  if (!recipients) {
    throw new Error('Recipient is required');
  }
  if (!senderAddress) {
    throw new Error('Sender address is required');
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

