import { BitcoinNetwork, GetBitcoinProviderFunc } from '../provider';

export interface SignMessagePayload {
  address: string;
  message: string;
  network: BitcoinNetwork;
}

export interface SignMessageOptions {
  getProvider?: GetBitcoinProviderFunc;
  onFinish: (response: string) => void;
  onCancel: () => void;
  payload: SignMessagePayload;
}
