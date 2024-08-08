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
  type AddListener,
} from '@sats-connect/core';
import {
  Config,
  loadSelector,
  selectWalletProvider,
  close,
  walletOpen,
  walletClose,
} from '@sats-connect/ui';
import { makeDefaultConfig } from '@sats-connect/make-default-provider-config';

class Wallet {
  private providerId: string | undefined;

  private defaultAdapters: Record<string, new () => SatsConnectAdapter> = defaultAdapters;

  private createCustomConfig?: (providers: SupportedWallet[]) => Config;

  private isProviderSet(): boolean {
    return !!this.providerId;
  }

  public setCreateCustomConfig(createCustomConfig: (providers: SupportedWallet[]) => Config) {
    this.createCustomConfig = createCustomConfig;
  }

  public async selectProvider() {
    const providers = getSupportedWallets();

    if (providers.length === 0) {
      throw new Error('No wallets detected, may want to prompt user to install a wallet.');
    }

    const selectorConfig = this.createCustomConfig
      ? this.createCustomConfig(providers)
      : makeDefaultConfig(providers);
    const nextProviderId = await selectWalletProvider(selectorConfig);
    this.providerId = nextProviderId;
  }

  public async disconnect() {
    await this.request('wallet_renouncePermissions', undefined);
    this.providerId = undefined;
    removeDefaultProvider();
  }

  public async request<Method extends keyof Requests>(
    method: Method,
    params: Params<Method>
  ): Promise<RpcResult<Method>> {
    loadSelector();

    const defaultProvider = getDefaultProvider();
    if (!this.isProviderSet()) {
      if (defaultProvider) {
        this.providerId = defaultProvider;
      } else {
        try {
          await this.selectProvider();
        } catch {
          return {
            status: 'error',
            error: {
              code: RpcErrorCode.INTERNAL_ERROR,
              message:
                'Failed to select the provider. User may have cancelled the selection prompt.',
            },
          };
        }
      }
    }
    const adapter = this.defaultAdapters[this.providerId as string];
    walletOpen(this.providerId as string);
    const response = adapter
      ? await new adapter().request(method, params)
      : await new BaseAdapter(this.providerId as string).request(method, params);
    walletClose();
    if (response?.status === 'error' && response.error?.code === RpcErrorCode.USER_REJECTION) {
      if (!defaultProvider) {
        this.providerId = undefined;
      }
    } else {
      setDefaultProvider(this.providerId as string);
    }
    close();
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

  public addListener: AddListener = (event, cb) => {
    const defaultProvider = getDefaultProvider();
    if (!this.isProviderSet() && defaultProvider) {
      this.providerId = defaultProvider;
    }

    if (!this.isProviderSet()) {
      throw new Error(
        'No wallet provider selected. The user must first select a wallet before adding listeners to wallet events.'
      );
    }

    const adapter = this.defaultAdapters[this.providerId as string];
    return new adapter().addListener(event, cb);
  };
}

export * from '@sats-connect/core';

export default new Wallet();
