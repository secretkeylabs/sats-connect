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
  createDefaultConfig,
} from '@sats-connect/core';
import { Config, loadSelector, selectWalletProvider, close } from '@sats-connect/ui';

loadSelector();

class Wallet {
  private static providerId: string | undefined;

  private static defaultAdapters: Record<string, new () => SatsConnectAdapter> = defaultAdapters;

  private static userAdapters: Record<string, new () => SatsConnectAdapter> = {};

  static createCustomConfig?: (providers: SupportedWallet[]) => Config;

  private static isProviderSet(): boolean {
    return !!this.providerId;
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
      : createDefaultConfig(providers);
    const nextProviderId = await selectWalletProvider(selectorConfig);
    this.providerId = nextProviderId;
    close();
  }

  static async disconnect() {
    this.providerId = undefined;
    removeDefaultProvider();
  }

  public static async request<Method extends keyof Requests>(
    method: Method,
    params: Params<Method>
  ): Promise<RpcResult<Method>> {
    const defaultProvider = getDefaultProvider();
    if (!this.isProviderSet()) {
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
    if (
      !defaultProvider &&
      response?.status === 'error' &&
      response.error?.code === RpcErrorCode.USER_REJECTION
    ) {
      this.providerId = undefined;
    } else {
      setDefaultProvider(this.providerId as string);
    }
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

export default Wallet;
