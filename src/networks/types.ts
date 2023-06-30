export enum BitcoinNetworkType {
  Mainnet = 'Mainnet',
  Testnet = 'Testnet',
}

export interface BitcoinNetwork {
  type: BitcoinNetworkType;
  address?: string;
}
