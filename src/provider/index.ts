import { BitcoinProvider } from './types';

export type GetBitcoinProviderFunc = () => Promise<BitcoinProvider | undefined>;

export async function getDefaultProvider(): Promise<BitcoinProvider | undefined> {
  return window.BitcoinProvider;
}

export * from './types';
