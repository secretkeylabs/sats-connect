import { type BitcoinProvider, type WebbtcProvider } from './types';

export const XverseProvider = {
  id: 'XverseProviders.BitcoinProvider',
  name: 'Xverse Wallet',
  icon: 'https://www.xverse.app/',
  webUrl: 'https://www.xverse.app/',
  chromeWebStoreUrl:
    'https://chrome.google.com/webstore/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg?hl=en-GB&authuser=1',
  googlePlayStoreUrl: 'https://play.google.com/store/apps/details?id=com.secretkeylabs.xverse',
  iOSAppStoreUrl: 'https://apps.apple.com/app/xverse-bitcoin-web3-wallet/id1552272513',
};

if (!window.webbtc_providers) window.webbtc_providers = [];

window.webbtc_providers.unshift(XverseProvider);

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
  if (!window.webbtc_providers) window.webbtc_providers = [XverseProvider];
  return window.webbtc_providers;
}

export function getProviderById(providerId: string) {
  if (Array.isArray(window.webbtc_providers)) {
    return window.webbtc_providers.find((provider) => provider.id === providerId);
  } else {
    console.error('window.webbtc_providers is not defined or not an array');
    return null;
  }
}

export * from './types';
