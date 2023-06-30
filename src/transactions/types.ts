import { BitcoinNetwork } from '../networks';
import { GetBitcoinProviderFunc } from '../provider';

export interface Recipient {
  address: string;
  amountSats: bigint;
}

export interface SendTransactionPayload {
  network: BitcoinNetwork;
  recipients: Recipient[];
  senderAddress: string;
  message?: string;
}

export interface SendTransactionOptions {
  getProvider?: GetBitcoinProviderFunc;
  onFinish: (response: string) => void;
  onCancel: () => void;
  payload: SendTransactionPayload;
}

export interface InputToSign {
  address: string;
  signingIndexes: Array<number>;
  sigHash?: number;
}

export interface SignTransactionPayload {
  network: BitcoinNetwork;
  message: string;
  psbtBase64: string;
  broadcast?: boolean;
  inputsToSign: InputToSign[];
}

export interface SignTransactionOptions {
  getProvider?: GetBitcoinProviderFunc;
  onFinish: (response: any) => void;
  onCancel: () => void;
  payload: SignTransactionPayload;
}

export interface SignTransactionResponse {
  psbtBase64: string;
  txId?: string;
}
