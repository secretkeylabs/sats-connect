import { createInscription } from '../src/inscriptions/index';
import type { CreateInscriptionOptions } from '../src/inscriptions/types';
import { BitcoinNetworkType } from '../src/types';
import { mockGetProvider } from '../fixtures/testFunc';
import { data } from '../fixtures/testData';

describe('test suite - createInscription', () => {
  it('test - valid CreateInscriptionOptions for text/html inscription', async () => {
    const options: CreateInscriptionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        contentType: 'text/html',
        content: 'content',
        payloadType: 'PLAIN_TEXT',
      },
      onFinish: (response) => {
        expect(response).toEqual(data.createInscriptionResponse);
      },
      onCancel: () => {},
    };
    expect(await createInscription(options)).toBeUndefined();
  });

  it('test - valid CreateInscriptionOptions for file/image inscription', async () => {
    const options: CreateInscriptionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        contentType: 'image/jpeg',
        content: 'content',
        payloadType: 'BASE_64',
      },
      onFinish: (response) => {
        expect(response).toEqual(data.createInscriptionResponse);
      },
      onCancel: () => {},
    };
    expect(await createInscription(options)).toBeUndefined();
  });

  it('test - valid CreateInscriptionOptions with optional properties', async () => {
    const options: CreateInscriptionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        contentType: 'text/html',
        content: 'content',
        payloadType: 'PLAIN_TEXT',
        appFeeAddress: '2NEYt8s1QPVmTmFTefMLidtmy66ZoqfSz7n',
        appFee: 1,
        suggestedMinerFeeRate: 10,
        token: 'token',
      },
      onFinish: (response) => {
        expect(response).toEqual(data.createInscriptionResponse);
      },
      onCancel: () => {},
    };
    expect(await createInscription(options)).toBeUndefined();
  });

  it('test - invalid network type', async () => {
    const options: CreateInscriptionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Testnet },
        contentType: 'text/html',
        content: 'content',
        payloadType: 'PLAIN_TEXT',
      },
      onFinish: () => {},
      onCancel: () => {},
    };
    await expect(createInscription(options)).rejects.toThrowError(
      'Only mainnet is currently supported for inscriptions'
    );
  });

  it('test - invalid contentType', async () => {
    const options: CreateInscriptionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        contentType: 'invalid content type',
        content: 'content',
        payloadType: 'PLAIN_TEXT',
      },
      onFinish: () => {},
      onCancel: () => {},
    };
    await expect(createInscription(options)).rejects.toThrowError('Invalid content type detected');
  });

  it('test - empty content', async () => {
    const options: CreateInscriptionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        contentType: 'text/html',
        content: '',
        payloadType: 'PLAIN_TEXT',
      },
      onFinish: () => {},
      onCancel: () => {},
    };
    await expect(createInscription(options)).rejects.toThrowError('Empty content not allowed');
  });

  it('test - invalid payloadType', async () => {
    const options: CreateInscriptionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        contentType: 'text/html',
        content: 'content',
      },
      onFinish: () => {},
      onCancel: () => {},
    } as any;
    await expect(createInscription(options)).rejects.toThrowError(
      'Empty invalid payloadType specified'
    );
  });

  it('test - content exceed max length', async () => {
    const options: CreateInscriptionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        contentType: 'text/html',
        content: 'A'.repeat(400e3 + 1),
        payloadType: 'PLAIN_TEXT',
      },
      onFinish: () => {},
      onCancel: () => {},
    };
    await expect(createInscription(options)).rejects.toThrowError('Content too large');
  });

  it('test - invalid combination of app fee address and fee', async () => {
    const options: CreateInscriptionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        contentType: 'text/html',
        content: 'content',
        payloadType: 'PLAIN_TEXT',
        appFeeAddress: '2NEYt8s1QPVmTmFTefMLidtmy66ZoqfSz7n',
        appFee: 0,
      },
      onFinish: () => {},
      onCancel: () => {},
    };
    await expect(createInscription(options)).rejects.toThrowError(
      'Invalid combination of app fee address and fee provided'
    );
  });

  it('test - invalid combination of app fee address without fee', async () => {
    const options: CreateInscriptionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        contentType: 'text/html',
        content: 'content',
        payloadType: 'PLAIN_TEXT',
        appFeeAddress: '2NEYt8s1QPVmTmFTefMLidtmy66ZoqfSz7n',
      },
      onFinish: () => {},
      onCancel: () => {},
    };
    await expect(createInscription(options)).rejects.toThrowError(
      'Invalid combination of app fee address and fee provided'
    );
  });
});
