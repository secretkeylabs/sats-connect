import { type BitcoinProvider, type WebbtcProvider } from './types';

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

export function getProviders(): WebbtcProvider[] {
  if (!window.webbtc_providers) window.webbtc_providers = [];
  return window.webbtc_providers;
}

export function getProviderById(providerId: string) {
  if (Array.isArray(window.webbtc_providers)) {
    const provider = window.webbtc_providers.find((provider) => provider.id === providerId);
    return provider?.id?.split('.').reduce((acc: any, part) => acc?.[part], window);
  } else {
    console.error('window.webbtc_providers is not defined or not an array');
    return null;
  }
}

export * from './types';
