import type { BitcoinProvider } from './types';

export async function getDefaultProvider(): Promise<BitcoinProvider | undefined> {
  return window.BitcoinProvider;
}

export * from './types';
