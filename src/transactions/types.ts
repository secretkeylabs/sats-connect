import { RequestOptions, RequestPayload } from '../types';

export interface Recipient {
  address: string;
  amountSats: bigint;
}

export interface SendTransactionPayload extends RequestPayload {
  recipients: Recipient[];
  senderAddress: string;
  message?: string;
}

export type SendTransactionResponse = string;

export type SendTransactionOptions = RequestOptions<
  SendTransactionPayload,
  SendTransactionResponse
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
