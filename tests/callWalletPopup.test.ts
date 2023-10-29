import { callWalletPopup } from '../src/call/index';
import type { CallWalletOptions } from '../src/call/types';
import { BitcoinNetworkType } from '../src/types';
import { mockGetProvider } from '../fixtures/testFunc';
import { data } from '../fixtures/testData';

describe('test suite - callWalletPopup', () => {
  it('test - valid CallWalletOptions', async () => {
    const options: CallWalletOptions = {
      getProvider: mockGetProvider,
      payload: {
        method: 'method',
        network: {
          type: BitcoinNetworkType.Mainnet,
        },
      },
      onFinish: (response) => {
        expect(response).toEqual(data.callResponse);
      },
      onCancel: () => {},
    };
    expect(await callWalletPopup(options)).toBeUndefined();
  });

  it('test - invalid wallet method', async () => {
    const options: CallWalletOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: {
          type: BitcoinNetworkType.Mainnet,
        },
      },
      onFinish: () => {},
      onCancel: () => {},
    } as any;
    await expect(callWalletPopup(options)).rejects.toThrow('A wallet method is required');
  });
});
