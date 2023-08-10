import type { Json } from 'jsontokens';
import { createUnsecuredToken } from 'jsontokens';

import { getDefaultProvider } from '../provider';
import type {
  Recipient,
  SendBtcTransactionOptions,
  SerializedRecipient,
  SerializedSendBtcTransactionPayload,
} from './types';

const serializer = (recipient: Recipient[]): SerializedRecipient[] => {
  return recipient.map((value) => {
    const { address, amountSats } = value;
    return {
      address,
      amountSats: amountSats.toString(),
    };
  });
};

export const sendBtcTransaction = async (options: SendBtcTransactionOptions) => {
  const { getProvider = getDefaultProvider } = options;
  const provider = await getProvider();
  if (!provider) {
    throw new Error('No Bitcoin wallet installed');
  }

  const { recipients, senderAddress, network, message } = options.payload;
  if (!recipients || recipients.length === 0) {
    throw new Error('At least one recipient is required');
  }
  if (
    recipients.some(
      (item) => typeof item.address !== 'string' || typeof item.amountSats !== 'bigint'
    )
  ) {
    throw new Error('Incorrect recipient format');
  }
  if (!senderAddress) {
    throw new Error('The sender address is required');
  }

  try {
    const serializedRecipients: SerializedRecipient[] = serializer(recipients);
    const serializedPayload: SerializedSendBtcTransactionPayload = {
      network,
      senderAddress,
      message,
      recipients: serializedRecipients,
    };
    const request = createUnsecuredToken(serializedPayload as unknown as Json);
    const response = await provider.sendBtcTransaction(request);
    options.onFinish?.(response);
  } catch (error) {
    console.error('[Connect] Error during send BTC transaction request', error);
    options.onCancel?.();
  }
};
