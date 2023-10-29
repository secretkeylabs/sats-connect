import { sendBtcTransaction } from '../src/transactions/index';
import type { SendBtcTransactionOptions } from '../src/transactions/types';
import { BitcoinNetworkType } from '../src/types';
import { mockGetProvider } from '../fixtures/testFunc';
import { data } from '../fixtures/testData';

describe('test suite - sendBtcTransaction', () => {
  it('test - valid SendBtcTransactionOptions', async () => {
    const options: SendBtcTransactionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Testnet },
        recipients: [
          {
            address: '2NBC9AJ9ttmn1anzL2HvvVML8NWzCfeXFq4',
            amountSats: 1500n,
          },
          {
            address: '2NFhRJfbBW8dhswyupAJWSehMz6hN5LjHzR',
            amountSats: 1500n,
          },
        ],
        senderAddress: 'bc1pcphm62adk8hah900lwqmsp3l57zuafnfh7ws7vcn0r65ee7lhalqmfge3t',
      },
      onFinish: (response) => {
        expect(response).toEqual(data.sendBtcTransactionResponse);
      },
      onCancel: () => {},
    };
    expect(await sendBtcTransaction(options)).toBeUndefined();
  });

  it('test - valid SendBtcTransactionOptions with optional properties', async () => {
    const options: SendBtcTransactionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Testnet },
        recipients: [
          {
            address: '2NBC9AJ9ttmn1anzL2HvvVML8NWzCfeXFq4',
            amountSats: 1500n,
          },
          {
            address: '2NFhRJfbBW8dhswyupAJWSehMz6hN5LjHzR',
            amountSats: 1500n,
          },
        ],
        senderAddress: 'bc1pcphm62adk8hah900lwqmsp3l57zuafnfh7ws7vcn0r65ee7lhalqmfge3t',
        message: 'message',
      },
      onFinish: (response) => {
        expect(response).toEqual(data.sendBtcTransactionResponse);
      },
      onCancel: () => {},
    };
    expect(await sendBtcTransaction(options)).toBeUndefined();
  });

  it('test - empty recipients', async () => {
    const options: SendBtcTransactionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Testnet },
        recipients: [],
        senderAddress: 'bc1pcphm62adk8hah900lwqmsp3l57zuafnfh7ws7vcn0r65ee7lhalqmfge3t',
      },
      onFinish: () => {},
      onCancel: () => {},
    };
    await expect(sendBtcTransaction(options)).rejects.toThrowError(
      'At least one recipient is required'
    );
  });

  it('test - invalid recipient format', async () => {
    const options: SendBtcTransactionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Testnet },
        recipients: [
          {
            address: 0,
            amountSats: 1500n,
          },
        ],
        senderAddress: 'bc1pcphm62adk8hah900lwqmsp3l57zuafnfh7ws7vcn0r65ee7lhalqmfge3t',
      },
      onFinish: () => {},
      onCancel: () => {},
    } as any;
    await expect(sendBtcTransaction(options)).rejects.toThrowError('Incorrect recipient format');
  });

  it('test - no sender address', async () => {
    const options: SendBtcTransactionOptions = {
      getProvider: mockGetProvider,
      payload: {
        network: { type: BitcoinNetworkType.Testnet },
        recipients: [
          {
            address: '2NBC9AJ9ttmn1anzL2HvvVML8NWzCfeXFq4',
            amountSats: 1500n,
          },
        ],
      },
      onFinish: () => {},
      onCancel: () => {},
    } as any;
    await expect(sendBtcTransaction(options)).rejects.toThrowError(
      'The sender address is required'
    );
  });
});
