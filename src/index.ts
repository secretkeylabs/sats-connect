import {
  SupportedWallet,
  defaultAdapters,
  getProviders,
  getSupportedWallets,
} from '@sats-connect/core';
import { SatsConnectAdapter } from '@sats-connect/core/dist/adapters/satsConnectAdapter';

import { ProviderOption, registerWalletSelector, selectProvider } from '@sats-connect/ui';
import { unisat as unisatIcon, xverse as xverseIcon } from './icons';
import { setDefaultProvider } from '@sats-connect/core';
import { getDefaultProvider } from '@sats-connect/core';
import { removeDefaultProvider } from '@sats-connect/core';

type WalletProviderConfig = {
  providerId: string;
  userAdapters?: Record<string, Adapter>;
};

registerWalletSelector();

class WalletProvider {
  private static providerId: string | undefined;

  private static defaultAdapters: Record<string, SatsConnectAdapter> = defaultAdapters;

  private static userAdapters: Record<string, SatsConnectAdapter> = {};

  private config: WalletProviderConfig;

  private static isProviderSet(): boolean {
    return !!WalletProvider.providerId;
  }

  private static defaultProviderOrdering(providers: SupportedWallet[]): Array<ProviderOption> {
    const providerOptions: Array<ProviderOption> = [];

    // Xverse
    const xverseProvider = providers.find(
      (provider) => provider.id === 'xverseProviders.bitcoinProvider'
    );
    if (xverseProvider) {
      providerOptions.push({
        name: xverseProvider.name,
        id: xverseProvider.id,
        icon: xverseProvider.icon,
      });
    } else {
      providerOptions.push({
        name: 'Xverse',
        id: 'xverseProviders.bitcoinProvider',
        icon: xverseIcon,
        installPrompt: {
          url: 'https://chromewebstore.google.com/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg',
        },
      });
    }

    // Unisat
    const unisatProvider = providers.find((provider) => provider.id === 'unisat');
    if (unisatProvider && unisatProvider.isInstalled) {
      providerOptions.push({
        name: unisatProvider.name,
        id: unisatProvider.id,
        icon: unisatProvider.icon,
      });
    }

    // Rest
    providerOptions.concat(
      providers
        .filter((provider) => {
          return provider.id !== 'xverseProviders.bitcoinProvider' && provider.id !== 'unisat';
        })
        .map((provider) => {
          return {
            name: provider.name,
            id: provider.id,
            icon: provider.icon,
          };
        })
    );

    return providerOptions;
  }
  static customProviderOrdering?: (providers: SupportedWallet[]) => Array<ProviderOption>;
  static setCustomProviderOrdering(
    customProviderOrdering: (providers: SupportedWallet[]) => Array<ProviderOption>
  ) {
    this.customProviderOrdering = customProviderOrdering;
  }

  static async selectProvider() {
    const providers = getSupportedWallets();

    if (providers.length === 0) {
      throw new Error('No wallets detected, may want to prompt user to install a wallet.');
    }

    const selectorConfig = this.customProviderOrdering
      ? this.customProviderOrdering(providers)
      : this.defaultProviderOrdering(providers);
    const nextProviderId = await selectProvider(selectorConfig);
    setDefaultProvider(nextProviderId);
    this.providerId = nextProviderId;
  }

  static async disconnect() {
    this.providerId = undefined;
    removeDefaultProvider();
  }

  public static async request(method: string, params?: any): Promise<any> {
    if (!this.isProviderSet()) {
      const defaultProvider = getDefaultProvider();
      if (defaultProvider) {
        WalletProvider.providerId = defaultProvider;
      } else {
        await WalletProvider.selectProvider();
      }
    }

    const adapter = { ...WalletProvider.defaultAdapters, ...WalletProvider.userAdapters }[
      WalletProvider.providerId as string
    ];
    return new adapter().request(method, params);
  }
}
