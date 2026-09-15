import { afterEach, expect, jest, test } from '@jest/globals';
import { addListener as addProviderListener, getDefaultProvider } from '@sats-connect/core';
import wallet from './index';

jest.mock('@sats-connect/core', () => ({
  BaseAdapter: class {
    request = jest.fn();
  },
  RpcErrorCode: {
    INTERNAL_ERROR: -32603,
    USER_REJECTION: -32000,
  },
  addListener: jest.fn(() => () => {}),
  defaultAdapters: {},
  getDefaultProvider: jest.fn(() => null),
  removeDefaultProvider: jest.fn(),
  setDefaultProvider: jest.fn(),
}));

jest.mock('@sats-connect/make-default-provider-config', () => ({
  makeDefaultConfig: jest.fn((providers) => ({ providers })),
}));

jest.mock('@sats-connect/ui', () => ({
  close: jest.fn(),
  loadSelector: jest.fn(),
  selectWalletProvider: jest.fn(),
  walletClose: jest.fn(),
  walletOpen: jest.fn(),
}));

jest.mock('./selectableProviders', () => ({
  getSelectableProviders: jest.fn(() => []),
}));

afterEach(() => {
  jest.clearAllMocks();
});

test('delegates listeners for a discovered provider to the standard provider API', () => {
  jest.mocked(getDefaultProvider).mockReturnValue('sqrl');
  const unsubscribe = jest.fn();
  jest.mocked(addProviderListener).mockReturnValue(unsubscribe);
  const listener = {
    eventName: 'disconnect' as const,
    cb: jest.fn(),
  };

  const result = wallet.addListener(listener);

  expect(addProviderListener).toHaveBeenCalledWith(listener, 'sqrl');
  expect(result).toBe(unsubscribe);
});
