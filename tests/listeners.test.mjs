import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import Wallet, {
  listen,
  removeDefaultProvider,
  request,
  setDefaultProvider,
} from '../dist/index.mjs';

const globals = ['window', 'document', 'localStorage'];
const originalDescriptors = globals.map((name) =>
  Object.getOwnPropertyDescriptor(globalThis, name)
);
let uiReads;
beforeEach(() => {
  uiReads = 0;
  const storage = new Map();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {}, writable: true });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
  });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: new Proxy(
      {},
      {
        get() {
          uiReads++;
          throw new Error('Listener registration must not open selection/approval UI');
        },
      }
    ),
  });
});
afterEach(() => {
  globals.forEach((name, index) => {
    if (originalDescriptors[index])
      Object.defineProperty(globalThis, name, originalDescriptors[index]);
    else delete globalThis[name];
  });
  assert.equal(uiReads, 0);
});
const newWallet = () => new Wallet.constructor();
const networkResult = {
  active: 'custom',
  networks: [{ id: 'custom', chainId: 0, transactionVersion: 128 }],
};
const accounts = [
  {
    address: 'SP123',
    publicKey: '02abc',
    gaiaHubUrl: 'https://gaia.invalid',
    gaiaAppKey: '0'.repeat(64),
  },
];

function installProvider(id, provider) {
  if (id === 'XverseProviders.BitcoinProvider')
    window.XverseProviders = { BitcoinProvider: provider };
  else window[id] = provider;
  setDefaultProvider(id);
}

test('fails synchronously without a selected provider instead of prompting or returning a fake subscription', () => {
  window.BitcoinProvider = {
    listen() {
      assert.fail('An unselected provider must not be used');
    },
  };
  const wallet = newWallet();
  assert.throws(() => wallet.listen('stx_networkChange', () => {}), /Select a wallet provider/);
  assert.throws(() => wallet.listen('stx_accountChange', () => {}), /Select a wallet provider/);
});

test('forwards both native Xverse events, the callback receiver, and exact cleanup functions', () => {
  const callbacks = new Map();
  const cleanups = new Map();
  const provider = {
    listen(event, callback) {
      assert.equal(this, provider);
      callbacks.set(event, callback);
      const cleanup = () => callbacks.delete(event);
      cleanups.set(event, cleanup);
      return cleanup;
    },
  };
  installProvider('XverseProviders.BitcoinProvider', provider);
  const wallet = newWallet();
  const seen = [];
  const removeNetwork = wallet.listen('stx_networkChange', (value) => seen.push(value));
  const removeAccounts = wallet.listen('stx_accountChange', (value) => seen.push(value));
  assert.equal(removeNetwork, cleanups.get('stx_networkChange'));
  assert.equal(removeAccounts, cleanups.get('stx_accountChange'));
  callbacks.get('stx_networkChange')(networkResult);
  callbacks.get('stx_accountChange')(accounts);
  assert.deepEqual(seen, [networkResult, accounts]);
  removeNetwork();
  removeNetwork();
  assert.equal(callbacks.has('stx_accountChange'), true);
  removeAccounts();
  assert.equal(callbacks.size, 0);
});

test('uses the selected instance provider instead of switching to a later saved default', () => {
  const calls = [];
  installProvider('FirstProvider', {
    listen(event) {
      calls.push(event);
      return () => {};
    },
  });
  const wallet = newWallet();
  wallet.listen('stx_networkChange', () => {});
  installProvider('OtherProvider', {
    listen() {
      assert.fail('Saved defaults must not replace an instance selection');
    },
  });
  wallet.listen('stx_accountChange', () => {});
  removeDefaultProvider();
  wallet.listen('stx_networkChange', () => {});
  assert.deepEqual(calls, ['stx_networkChange', 'stx_accountChange', 'stx_networkChange']);
});

test('delegates to an adapter on one instance and retains its native receiver', () => {
  let constructed = 0;
  const cleanup = () => {};
  const callback = () => {};
  class Adapter {
    constructor() {
      constructed++;
    }
    listen(event, cb) {
      assert.equal(this instanceof Adapter, true);
      assert.equal(event, 'stx_accountChange');
      assert.equal(cb, callback);
      return cleanup;
    }
  }
  const wallet = newWallet();
  wallet.defaultAdapters = { AdapterProvider: Adapter };
  setDefaultProvider('AdapterProvider');
  assert.equal(wallet.listen('stx_accountChange', callback), cleanup);
  assert.equal(constructed, 1);
});

test('request-only and unrecognized adapters can still use a native injected listener', () => {
  for (const withAdapter of [true, false]) {
    const callback = () => {};
    const cleanup = () => {};
    const provider = {
      listen(event, cb) {
        assert.equal(this, provider);
        assert.equal(event, 'stx_accountChange');
        assert.equal(cb, callback);
        return cleanup;
      },
    };
    installProvider('CustomProvider', provider);
    const wallet = newWallet();
    wallet.defaultAdapters = withAdapter ? { CustomProvider: class {} } : {};
    assert.equal(wallet.listen('stx_accountChange', callback), cleanup);
  }
});

test('never translates legacy account events or calls an approval RPC when listen is unavailable', () => {
  installProvider('XverseProviders.BitcoinProvider', {
    request() {
      assert.fail('Listen must not request stx_getAccounts or any other RPC');
    },
    addListener() {
      assert.fail('Listen must not synthesize SIP results from legacy events');
    },
  });
  const wallet = newWallet();
  assert.throws(() => wallet.listen('stx_accountChange', () => {}), /does not support SIP-030/);
  assert.throws(() => wallet.listen('stx_networkChange', () => {}), /does not support SIP-030/);
});

test('legacy addListener keeps its object/positional calling conventions and event envelopes', () => {
  const registrations = [];
  const cleanup = () => {};
  installProvider('XverseProviders.BitcoinProvider', {
    addListener(info) {
      registrations.push(info);
      info.cb({ type: 'accountChange', addresses: [] });
      return cleanup;
    },
  });
  const wallet = newWallet();
  const seen = [];
  const callback = (event) => seen.push(event);
  const info = { eventName: 'accountChange', cb: callback };
  assert.equal(wallet.addListener(info), cleanup);
  assert.equal(wallet.addListener('accountChange', callback), cleanup);
  assert.equal(registrations[0], info);
  assert.deepEqual(registrations[1], info);
  assert.deepEqual(seen, [
    { type: 'accountChange', addresses: [] },
    { type: 'accountChange', addresses: [] },
  ]);
});

test('named listen is re-exported and supports an explicitly selected provider', () => {
  const cleanup = () => {};
  const callback = () => {};
  window.CustomProvider = {
    listen(event, cb) {
      assert.equal(this, window.CustomProvider);
      assert.equal(event, 'stx_accountChange');
      assert.equal(cb, callback);
      return cleanup;
    },
  };
  assert.equal(listen('stx_accountChange', callback, 'CustomProvider'), cleanup);
});

test('re-exported requests expose stx_getNetworks without modifying its result or parameters', async () => {
  const calls = [];
  window.CustomProvider = {
    async request(method, params) {
      assert.equal(this, window.CustomProvider);
      calls.push([method, params]);
      if (method === 'getInfo')
        return { jsonrpc: '2.0', id: 'info', error: { code: -32601, message: 'Unsupported' } };
      return { jsonrpc: '2.0', id: 'networks', result: networkResult };
    },
  };
  assert.deepEqual(await request('stx_getNetworks', null, 'CustomProvider'), {
    status: 'success',
    result: networkResult,
  });
  assert.deepEqual(calls, [
    ['getInfo', null],
    ['stx_getNetworks', null],
  ]);
});
