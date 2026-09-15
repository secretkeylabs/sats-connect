import { afterEach, expect, jest, test } from '@jest/globals';
import { getSelectableProviders } from './selectableProviders';

const BUILT_INS = {
  xverse: {
    id: 'XverseProviders.BitcoinProvider',
    name: 'Xverse',
    icon: 'data:image/png;base64,eA==',
  },
};

jest.mock('@sats-connect/core', () => ({
  DefaultAdaptersInfo: {
    xverse: {
      id: 'XverseProviders.BitcoinProvider',
      name: 'Xverse',
      icon: 'data:image/png;base64,eA==',
    },
  },
  getProviderById: (id: string) =>
    id
      .split('.')
      .reduce<unknown>(
        (value, segment) =>
          value && typeof value === 'object'
            ? (value as Record<string, unknown>)[segment]
            : undefined,
        globalThis.window
      ),
  getProviders: () => globalThis.window.btc_providers ?? [],
  getSupportedWallets: () => [
    {
      id: 'XverseProviders.BitcoinProvider',
      name: 'Xverse',
      icon: 'data:image/png;base64,eA==',
      isInstalled: false,
    },
  ],
}));

const originalWindow = globalThis.window;

afterEach(() => {
  Object.defineProperty(globalThis, 'window', {
    value: originalWindow,
    configurable: true,
    writable: true,
  });
});

test('appends installed WBIP004 providers without hardcoding wallet brands', () => {
  const sqrl = { request: jest.fn() };
  Object.defineProperty(globalThis, 'window', {
    value: {
      sqrl,
      btc_providers: [
        {
          id: 'sqrl',
          name: 'Sqrl',
          icon: 'data:image/svg+xml;base64,PHN2Zy8+',
          methods: ['getInfo', 'wallet_connect'],
        },
      ],
    },
    configurable: true,
    writable: true,
  });

  expect(getSelectableProviders()).toEqual([
    ...Object.values(BUILT_INS).map((provider) => ({
      ...provider,
      isInstalled: false,
    })),
    {
      id: 'sqrl',
      name: 'Sqrl',
      icon: 'data:image/svg+xml;base64,PHN2Zy8+',
      methods: ['getInfo', 'wallet_connect'],
      isInstalled: true,
    },
  ]);
});

test('keeps built-in precedence and rejects malformed or unsafe entries', () => {
  const builtIn = Object.values(BUILT_INS)[0];
  Object.defineProperty(globalThis, 'window', {
    value: {
      sqrl: { request: jest.fn() },
      duplicate: { request: jest.fn() },
      btc_providers: [
        { ...builtIn, name: 'Spoofed built-in' },
        {
          id: 'sqrl',
          name: 'Sqrl',
          icon: 'data:image/png;base64,AA==',
        },
        {
          id: 'sqrl',
          name: 'Duplicate Sqrl',
          icon: 'data:image/png;base64,AA==',
        },
        {
          id: '__proto__.polluted',
          name: 'Unsafe',
          icon: 'data:image/png;base64,AA==',
        },
        {
          id: 'missing',
          name: 'Missing provider object',
          icon: 'data:image/png;base64,AA==',
        },
        {
          id: 'duplicate',
          name: '',
          icon: 'https://example.com/icon.png',
        },
      ],
    },
    configurable: true,
    writable: true,
  });

  const providers = getSelectableProviders();
  expect(providers.filter((provider) => provider.id === builtIn.id)).toHaveLength(1);
  expect(providers.find((provider) => provider.id === builtIn.id)?.name).toBe(builtIn.name);
  expect(providers.filter((provider) => provider.id === 'sqrl')).toHaveLength(1);
  expect(providers.map((provider) => provider.id)).not.toContain('__proto__.polluted');
  expect(providers.map((provider) => provider.id)).not.toContain('missing');
  expect(providers.map((provider) => provider.id)).not.toContain('duplicate');
});
