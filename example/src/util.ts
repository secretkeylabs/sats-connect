import { BitcoinNetworkType } from '@sats-connect/core';

export function getMempoolEndpoint(network: BitcoinNetworkType): string {
  let url = 'https://mempool.space/';
  switch (network) {
    case BitcoinNetworkType.Testnet:
      url += 'testnet/';
      break;
    case BitcoinNetworkType.Signet:
      url += 'signet/';
      break;
    case BitcoinNetworkType.Testnet4:
      url += 'testnet4/';
      break;
  }
  return url;
}
