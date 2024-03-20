import {
  SupportedWallet,
  defaultAdapters,
  getProviders,
  getSupportedWallets,
} from '@sats-connect/core';
import { SatsConnectAdapter } from '@sats-connect/core/dist/adapters/satsConnectAdapter';

import { registerWalletSelector, selectProvider } from '@sats-connect/ui';

const getDefaultProvider = () => {
  return 'xverseProviders.bitcoinProvider';
};

type WalletProviderConfig = {
  providerId: string;
  userAdapters?: Record<string, Adapter>;
};

function customSelectorConfig(providers: SupportedWallet[]) {}

class WalletProvider {
  private static providerId: string;

  private static defaultAdapters: Record<string, SatsConnectAdapter> = defaultAdapters;

  private static userAdapters: Record<string, SatsConnectAdapter> = {};

  private config: WalletProviderConfig;

  private static isProviderSet(): boolean {
    return !!WalletProvider.providerId;
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

        const selectorConfig = customSelectorConfig(providers);
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
