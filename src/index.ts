import {
  Params,
  Requests,
  RpcResult,
  SupportedWallet,
  defaultAdapters,
  getSupportedWallets,
  SatsConnectAdapter,
  setDefaultProvider,
  getDefaultProvider,
  removeDefaultProvider,
} from '@sats-connect/core';
import { ProviderOption, registerWalletSelector, selectProvider } from '@sats-connect/ui';
import { xverse as xverseIcon } from './icons';

registerWalletSelector();

class WalletProvider {
  private static providerId: string | undefined;

  private static defaultAdapters: Record<string, new () => SatsConnectAdapter> = defaultAdapters;

  private static userAdapters: Record<string, new () => SatsConnectAdapter> = {};

  static customProviderOrdering?: (providers: SupportedWallet[]) => Array<ProviderOption>;

  private static isProviderSet(): boolean {
    return !!WalletProvider.providerId;
  }

  private static defaultProviderOrdering(providers: SupportedWallet[]): Array<ProviderOption> {
    const providerOptions: Array<ProviderOption> = [];
    // Xverse
    const xverseProvider = providers.find(
      (provider) => provider.id === 'XverseProviders.BitcoinProvider'
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
        id: 'XverseProviders.BitcoinProvider',
        icon: xverseIcon,
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

  public static async request<Method extends keyof Requests>(
    method: Method,
    params: Params<Method>
  ): Promise<RpcResult<Method>> {
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

    const response = await new adapter().request(method, params);
    if (!response) {
      throw new Error('No response from wallet');
    }
    return response;
  }
}

export * from '@sats-connect/core';

export default WalletProvider;
