import { GetBitcoinProviderFunc } from './provider';

export enum BitcoinNetworkType {
  Mainnet = 'Mainnet',
  Testnet = 'Testnet',
}

export interface BitcoinNetwork {
  type: BitcoinNetworkType;
  address?: string;
}

export interface RequestPayload {
  network: BitcoinNetwork;
}

export interface RequestOptions<Payload extends RequestPayload, Response> {
  onFinish: (response: Response) => void;
  onCancel: () => void;
  payload: Payload;
  getProvider?: GetBitcoinProviderFunc;
}
