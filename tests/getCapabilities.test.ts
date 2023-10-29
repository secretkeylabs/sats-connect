import { getCapabilities } from '../src/capabilities/index';
import type { GetCapabilitiesOptions } from '../src/capabilities/types';
import { BitcoinNetworkType } from '../src/types';
import { mockGetProvider } from '../fixtures/testFunc';

describe('test suite - getCapabilities', () => {
  it('test - valid GetCapabilitiesOptions', async () => {
    const options: GetCapabilitiesOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: {
          type: BitcoinNetworkType.Mainnet,
        },
      },
      onFinish: (response) => {
        expect(response).toEqual([
          'call',
          'connect',
          'signMessage',
          'signTransaction',
          'sendBtcTransaction',
          'createInscription',
        ]);
      },
      onCancel: () => {},
    };
    expect(await getCapabilities(options)).toBeUndefined();
  });
});
