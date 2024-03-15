import { type BitcoinProvider, type Provider } from './types';

export async function getProviderOrThrow(
  getProvider?: () => Promise<BitcoinProvider | undefined>
): Promise<BitcoinProvider> {
  const provider =
    (await getProvider?.()) || window.XverseProviders?.BitcoinProvider || window.BitcoinProvider;

  if (!provider) {
    throw new Error('No Bitcoin wallet installed');
  }

  return provider;
}

export function getProviders(): Provider[] {
  if (!window.btc_providers) window.btc_providers = [];
  return window.btc_providers;
}

export function getProviderById(providerId: string) {
  if (Array.isArray(window.btc_providers)) {
    const provider = window.btc_providers.find((provider) => provider.id === providerId);
    return provider?.id?.split('.').reduce((acc: any, part) => acc?.[part], window);
  } else {
    console.log('window.btc_providers is not defined or not an array');
    return undefined;
  }
}

export * from './types';
