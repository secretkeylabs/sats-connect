import { BitcoinNetwork, GetBitcoinProviderFunc } from '../provider';

export enum CallMethod {
  SIGN_TRANSACTION = 'signTransaction',
  GET_ADDRESS = 'getAddress',
}

export interface CallWalletPayload {
  method: string;
  network: BitcoinNetwork;
  params?: Array<any>;
}

export interface CallWalletOptions {
  getProvider?: GetBitcoinProviderFunc;
  onFinish: (response: Record<string, any>) => void;
  onCancel: () => void;
  payload: CallWalletPayload;
}
