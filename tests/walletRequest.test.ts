import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const adapterRequest = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const baseRequest = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const constructAdapter = jest.fn();
const getDefaultProvider = jest.fn<() => string | undefined>();
const setDefaultProvider = jest.fn();
const close = jest.fn();
const walletClose = jest.fn();
const walletOpen = jest.fn();
const userRejection = -32000;

jest.unstable_mockModule('@sats-connect/core', () => ({
  BaseAdapter: class {
    request = baseRequest;
  },
  RpcErrorCode: { INTERNAL_ERROR: -32603, USER_REJECTION: userRejection },
  defaultAdapters: {
    known: class {
      constructor() {
        constructAdapter();
      }
      request = adapterRequest;
    },
  },
  getDefaultProvider,
  getSupportedWallets: jest.fn(),
  removeDefaultProvider: jest.fn(),
  setDefaultProvider,
  unlockDefinitionSchema: {},
}));

jest.unstable_mockModule('@sats-connect/make-default-provider-config', () => ({
  makeDefaultConfig: jest.fn(),
}));

jest.unstable_mockModule('@sats-connect/ui', () => ({
  close,
  loadSelector: jest.fn(),
  selectWalletProvider: jest.fn(),
  walletClose,
  walletOpen,
}));

const { default: Wallet } = await import('../src/index');
const newWallet = () => new (Wallet.constructor as new () => typeof Wallet)();

beforeEach(() => {
  jest.resetAllMocks();
  getDefaultProvider.mockReturnValue('known');
});

describe('Wallet.request UI cleanup', () => {
  it.each([
    { provider: 'known', error: new Error('Provider unavailable') },
    { provider: 'custom', error: 'Provider unavailable' },
  ])('closes the UI when the $provider adapter rejects', async ({ provider, error }) => {
    getDefaultProvider.mockReturnValue(provider);
    const request = provider === 'known' ? adapterRequest : baseRequest;
    request.mockRejectedValue(error);

    await expect(newWallet().request('getInfo', null)).rejects.toBe(error);

    expect(request).toHaveBeenCalledWith('getInfo', null);
    expect(walletOpen).toHaveBeenCalledWith(provider);
    expect(walletClose).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(walletClose.mock.invocationCallOrder[0]).toBeLessThan(close.mock.invocationCallOrder[0]);
    expect(setDefaultProvider).not.toHaveBeenCalled();
  });

  it('closes the UI when constructing an adapter throws', async () => {
    const error = new Error('Adapter initialization failed');
    constructAdapter.mockImplementation(() => {
      throw error;
    });

    await expect(newWallet().request('getInfo', null)).rejects.toBe(error);

    expect(walletClose).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(setDefaultProvider).not.toHaveBeenCalled();
  });

  it('closes the UI when an adapter request throws synchronously', async () => {
    const error = new Error('Provider unavailable');
    adapterRequest.mockImplementation(() => {
      throw error;
    });

    await expect(newWallet().request('getInfo', null)).rejects.toBe(error);

    expect(walletClose).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(setDefaultProvider).not.toHaveBeenCalled();
  });

  it('can reuse the selected provider after a rejected request', async () => {
    const error = new Error('Provider unavailable');
    const response = { status: 'success', result: { version: '1.0.0' } };
    adapterRequest.mockRejectedValueOnce(error).mockResolvedValueOnce(response);
    const wallet = newWallet();

    await expect(wallet.request('getInfo', null)).rejects.toBe(error);
    await expect(wallet.request('getInfo', null)).resolves.toBe(response);

    expect(walletClose).toHaveBeenCalledTimes(2);
    expect(close).toHaveBeenCalledTimes(2);
    expect(setDefaultProvider).toHaveBeenCalledTimes(1);
    expect(setDefaultProvider).toHaveBeenCalledWith('known');
  });

  it('keeps the UI open until a successful request settles and preserves its result', async () => {
    const response = { status: 'success', result: { version: '1.0.0' } };
    let resolveRequest!: (value: unknown) => void;
    adapterRequest.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    const pending = newWallet().request('getInfo', null);
    expect(walletOpen).toHaveBeenCalledWith('known');
    expect(walletClose).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    resolveRequest(response);

    await expect(pending).resolves.toBe(response);
    expect(setDefaultProvider).toHaveBeenCalledWith('known');
    expect(walletClose).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(walletClose.mock.invocationCallOrder[0]).toBeLessThan(
      setDefaultProvider.mock.invocationCallOrder[0]
    );
    expect(setDefaultProvider.mock.invocationCallOrder[0]).toBeLessThan(
      close.mock.invocationCallOrder[0]
    );
  });

  it.each([userRejection, -32603])('preserves a resolved RPC error with code %s', async (code) => {
    const response = { status: 'error', error: { code, message: 'Request failed' } };
    adapterRequest.mockResolvedValue(response);

    await expect(newWallet().request('getInfo', null)).resolves.toBe(response);

    expect(walletClose).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    if (code === userRejection) {
      expect(setDefaultProvider).not.toHaveBeenCalled();
    } else {
      expect(setDefaultProvider).toHaveBeenCalledWith('known');
    }
  });

  it('preserves the fallback error for a missing adapter response', async () => {
    adapterRequest.mockResolvedValue(undefined);

    await expect(newWallet().request('getInfo', null)).resolves.toEqual({
      status: 'error',
      error: { code: -32603, message: 'Wallet Error processing the request' },
    });

    expect(walletClose).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(setDefaultProvider).toHaveBeenCalledWith('known');
  });
});
