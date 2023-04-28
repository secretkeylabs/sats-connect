import { BitcoinNetwork } from '../provider';

export interface SignMessagePayload {
  address: string;
  message: string;
  network: BitcoinNetwork;
}

export interface SignMessageOptions {
  onFinish: (response: string) => void;
  onCancel: () => void;
  payload: SignMessagePayload;
}
