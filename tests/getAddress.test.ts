import { getAddress } from '../src/addresses/index';
import { GetAddressOptions, AddressPurpose } from '../src/addresses/types';
import { BitcoinNetworkType } from '../src/types';
import { mockGetProvider } from '../fixtures/testFunc';
import { data } from '../fixtures/testData';

describe('test suite - getAddress', () => {
  it('test - valid GetAddressOptions', async () => {
    const options: GetAddressOptions = {
      getProvider: mockGetProvider,
      payload: {
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
        message: 'message',
        network: {
          type: BitcoinNetworkType.Mainnet,
        },
      },
      onFinish: (response) => {
        expect(response).toEqual(data.connectResponse);
      },
      onCancel: jest.fn(),
    };
    expect(await getAddress(options)).toBeUndefined();
  });
});
