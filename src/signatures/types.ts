import { BitcoinNetwork, BitcoinProvider } from '../provider';

export interface SignMessagePayload {
  address: string;
  message: string;
  network: BitcoinNetwork;
}

export interface SignMessageOptions {
  getProvider?: () => Promise<BitcoinProvider>;
  onFinish: (response: string) => void;
  onCancel: () => void;
  payload: SignMessagePayload;
}
