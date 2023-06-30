import { BitcoinNetwork } from '../networks';
import { GetBitcoinProviderFunc } from '../provider';

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
