import {
  SupportedWallet,
  defaultAdapters,
  getProviders,
  getSupportedWallets,
} from '@sats-connect/core';
import { SatsConnectAdapter } from '@sats-connect/core/dist/adapters/satsConnectAdapter';

import { ProviderOption, registerWalletSelector, selectProvider } from '@sats-connect/ui';
import { unisat as unisatIcon, xverse as xverseIcon } from './icons';

const getDefaultProvider = () => {
  return 'xverseProviders.bitcoinProvider';
};

type WalletProviderConfig = {
  providerId: string;
  userAdapters?: Record<string, Adapter>;
};

class WalletProvider {
  private static providerId: string;

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

  // selectProvider
  // disconnect

  public static async request(method: string, params?: any): Promise<any> {
    if (!this.isProviderSet()) {
      let nextProviderId = getDefaultProvider();
      if (!nextProviderId) {
        registerWalletSelector();
        const providers = getSupportedWallets();

        if (providers.length === 0) {
          throw new Error('No wallets detected, may want to prompt user to install a wallet.');
        }

        const selectorConfig = this.customProviderOrdering
          ? this.customProviderOrdering(providers)
          : this.defaultProviderOrdering(providers);
        nextProviderId = await selectProvider(selectorConfig);
        setDefaultProvider(nextProviderId);
      }
      WalletProvider.providerId = nextProviderId; // Or provider = new WalletProvider(nextProviderId)
    }
    // # Option 1
    const adapter = { ...WalletProvider.defaultAdapters, ...WalletProvider.userAdapters }[
      WalletProvider.providerId
    ];
    return new adapter().request(method, params);
  }
}
