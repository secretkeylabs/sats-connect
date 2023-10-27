import { getProviderOrThrow } from '../src/provider/index';
import { mockGetProvider } from '../fixtures/testFunc';

describe('test suite - getProvider', () => {
  it('test - valid getProvider', async () => {
    await expect(getProviderOrThrow(mockGetProvider)).resolves.toMatchObject({
      call: expect.any(Function),
      connect: expect.any(Function),
      createInscription: expect.any(Function),
      sendBtcTransaction: expect.any(Function),
      signMessage: expect.any(Function),
      signTransaction: expect.any(Function),
    });
  });

  it('test - invalid getProvider', async () => {
    await expect(getProviderOrThrow(undefined)).rejects.toThrowError('window is not defined');
  });
});
