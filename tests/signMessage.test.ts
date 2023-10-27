import { signMessage } from '../src/messages/index';
import type { SignMessageOptions } from '../src/messages/types';
import { BitcoinNetworkType } from '../src/types';
import { mockGetProvider } from '../fixtures/testFunc';
import { data } from '../fixtures/testData';

describe('test suite - signMessage', () => {
  it('test - valid SignMessageOptions', async () => {
    const options: SignMessageOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        address: 'bc1pcphm62adk8hah900lwqmsp3l57zuafnfh7ws7vcn0r65ee7lhalqmfge3t',
        message: 'message',
      },
      onFinish: (response) => {
        expect(response).toEqual(data.signMessageResponse);
      },
      onCancel: jest.fn(),
    };
    expect(await signMessage(options)).toBeUndefined();
  });

  it('test - invalid address', async () => {
    const options: SignMessageOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        address: '',
        message: 'message',
      },
      onFinish: jest.fn(),
      onCancel: jest.fn(),
    };
    await expect(signMessage(options)).rejects.toThrowError(
      'An address is required to sign a message'
    );
  });

  it('test - invalid message', async () => {
    const options: SignMessageOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        address: 'bc1pcphm62adk8hah900lwqmsp3l57zuafnfh7ws7vcn0r65ee7lhalqmfge3t',
        message: '',
      },
      onFinish: jest.fn(),
      onCancel: jest.fn(),
    };
    await expect(signMessage(options)).rejects.toThrowError('A message to be signed is required');
  });
});
