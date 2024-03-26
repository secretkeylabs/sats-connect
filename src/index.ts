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
  RpcErrorCode,
  BaseAdapter,
} from '@sats-connect/core';
import {
  Config,
  loadSelector,
  selectWalletProvider,
  TWalletProviderOption,
} from '@sats-connect/ui';
import { xverse as xverseIcon } from './icons';

loadSelector();

class WalletProvider {
  private static providerId: string | undefined;

  private static defaultAdapters: Record<string, new () => SatsConnectAdapter> = defaultAdapters;

  private static userAdapters: Record<string, new () => SatsConnectAdapter> = {};

  static createCustomConfig?: (providers: SupportedWallet[]) => Array<TWalletProviderOption>;

  private static isProviderSet(): boolean {
    return !!WalletProvider.providerId;
  }

  private static createProviderOption(provider: SupportedWallet): TWalletProviderOption {
    return {
      name: provider.name,
      id: provider.id,
      icon: provider.icon,
    };
  }

  private static createDefaultConfig(providers: SupportedWallet[]): Config {
    const config: Config = [];
    // Xverse
    const xverseProvider = providers.find(
      (provider) => provider.id === 'XverseProviders.BitcoinProvider'
    );
    config.push(
      xverseProvider
        ? this.createProviderOption(xverseProvider)
        : {
            name: 'Xverse',
            id: 'XverseProviders.BitcoinProvider',
            icon: xverseIcon,
          }
    );

    // Unisat
    const unisatProvider = providers.find((provider) => provider.id === 'unisat');
    if (unisatProvider && unisatProvider.isInstalled) {
      config.push(this.createProviderOption(unisatProvider));
    }

    // Rest
    config.concat(
      providers
        .filter((provider) => {
          return provider.id !== 'xverseProviders.bitcoinProvider' && provider.id !== 'unisat';
        })
        .map((provider) => this.createProviderOption(provider))
    );

    return config;
  }
  static setCreateCustomConfig(createCustomConfig: (providers: SupportedWallet[]) => Config) {
    this.createCustomConfig = createCustomConfig;
  }

  static async selectProvider() {
    const providers = getSupportedWallets();

    if (providers.length === 0) {
      throw new Error('No wallets detected, may want to prompt user to install a wallet.');
    }

    const selectorConfig = this.createCustomConfig
      ? this.createCustomConfig(providers)
      : this.createDefaultConfig(providers);
    const nextProviderId = await selectWalletProvider(selectorConfig);
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
        this.providerId = defaultProvider;
      } else {
        await this.selectProvider();
      }
    }
    const adapter = { ...this.defaultAdapters, ...this.userAdapters }[this.providerId as string];
    const response = adapter
      ? await new adapter().request(method, params)
      : await new BaseAdapter(this.providerId as string).request(method, params);
    if (!response) {
      return {
        status: 'error',
        error: {
          code: RpcErrorCode.INTERNAL_ERROR,
          message: 'Wallet Error processing the request',
        },
      };
    }
    return response;
  }
}

export * from '@sats-connect/core';

export default WalletProvider;
