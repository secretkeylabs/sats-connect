import { signTransaction } from '../src/transactions/index';
import type { SignTransactionOptions } from '../src/transactions/types';
import { BitcoinNetworkType } from '../src/types';
import { mockGetProvider } from '../fixtures/testFunc';
import { data } from '../fixtures/testData';

describe('test suite - signTransaction', () => {
  it('test - valid SignTransactionOptions', async () => {
    const options: SignTransactionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        psbtBase64: 'cHNidP8BAJwCAmO+JvQJxhVDDpm3tV5PmPfzvJOSL4GOdjEOpAAAAAAnrAAA==',
        message: 'message',
        inputsToSign: [
          {
            address: 'bc1pr09enf3yc43cz8qh7xwaasuv3xzlgfttdr3wn0q2dy9frkhrpdtsk05jqq',
            signingIndexes: [0],
          },
          {
            address: '33TKH4kkiFPyTLDNmdNsLggyLeAYre57Qm',
            signingIndexes: [1, 2],
          },
        ],
      },
      onFinish: (response) => {
        expect(response).toEqual(data.signTransactionResponse);
      },
      onCancel: jest.fn(),
    };
    expect(await signTransaction(options)).toBeUndefined();
  });

  it('test - valid SignTransactionOptions with optional properties', async () => {
    const options: SignTransactionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        psbtBase64: 'cHNidP8BAJwCAmO+JvQJxhVDDpm3tV5PmPfzvJOSL4GOdjEOpAAAAAAnrAAA==',
        broadcast: true,
        message: 'message',
        inputsToSign: [
          {
            address: 'bc1pr09enf3yc43cz8qh7xwaasuv3xzlgfttdr3wn0q2dy9frkhrpdtsk05jqq',
            signingIndexes: [0],
            sigHash: 131,
          },
          {
            address: '33TKH4kkiFPyTLDNmdNsLggyLeAYre57Qm',
            signingIndexes: [1, 2],
            sigHash: 131,
          },
        ],
      },
      onFinish: (response) => {
        expect(response).toEqual(data.signTransactionResponse);
      },
      onCancel: jest.fn(),
    };
    expect(await signTransaction(options)).toBeUndefined();
  });

  it('test - invalid psbtBase64', async () => {
    const options: SignTransactionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        psbtBase64: '',
        broadcast: false,
        message: 'message',
        inputsToSign: [
          {
            address: 'bc1pr09enf3yc43cz8qh7xwaasuv3xzlgfttdr3wn0q2dy9frkhrpdtsk05jqq',
            signingIndexes: [0],
          },
          {
            address: '33TKH4kkiFPyTLDNmdNsLggyLeAYre57Qm',
            signingIndexes: [1, 2],
          },
        ],
      },
      onFinish: jest.fn(),
      onCancel: jest.fn(),
    };
    await expect(signTransaction(options)).rejects.toThrowError(
      'A value for psbtBase64 representing the tx hash is required'
    );
  });
});
