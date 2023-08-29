import type { RequestOptions, RequestPayload } from '../types';

export interface Recipient {
  address: string;
  amountSats: bigint;
}

export type SerializedRecipient = Omit<Recipient, 'amountSats'> & {
  amountSats: string;
};

export interface SendBtcTransactionPayload extends RequestPayload {
  recipients: Recipient[];
  senderAddress: string;
  message?: string;
}

export type SerializedSendBtcTransactionPayload = Omit<SendBtcTransactionPayload, 'recipients'> & {
  recipients: SerializedRecipient[];
};

export type SendBtcTransactionResponse = string;

export type SendBtcTransactionOptions = RequestOptions<
  SendBtcTransactionPayload,
  SendBtcTransactionResponse
>;

export interface InputToSign {
  address: string;
  signingIndexes: number[];
  sigHash?: number;
}

export interface SignTransactionPayload extends RequestPayload {
  message: string;
  psbtBase64: string;
  inputsToSign: InputToSign[];
  broadcast?: boolean;
}

export interface SignTransactionResponse {
  psbtBase64: string;
  txId?: string;
}

export type SignTransactionOptions = RequestOptions<
  SignTransactionPayload,
  SignTransactionResponse
>;
