import { BitcoinNetworkType } from '../src/types';
import { callWalletPopup } from '../src/call/index';
import { getAddress } from '../src/addresses/index';
import { GetAddressOptions, AddressPurpose } from '../src/addresses/types';
import { signMessage } from '../src/messages/index';
import { signTransaction } from '../src/transactions/index';
import { sendBtcTransaction } from '../src/transactions/index';
import { createInscription } from '../src/inscriptions/index';
import type { CallWalletOptions } from '../src/call/types';
import type { SignMessageOptions } from '../src/messages/types';
import type { SignTransactionOptions } from '../src/transactions/types';
import type { SendBtcTransactionOptions } from '../src/transactions/types';
import type { CreateInscriptionOptions } from '../src/inscriptions/types';

jest.mock('../src/provider', () => ({
  ...jest.requireActual('../src/provider'),
  getProviderOrThrow: jest.fn(),
}));

describe('test suite - console error', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('test - console error in callWalletPopup function', async () => {
    const spy = jest.spyOn(console, 'error');
    const options: CallWalletOptions = {
      payload: {
        method: 'method',
        network: {
          type: BitcoinNetworkType.Mainnet,
        },
      },
      onFinish: () => {},
      onCancel: () => {},
    };
    await callWalletPopup(options);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('test - console error in getAddress function', async () => {
    const spy = jest.spyOn(console, 'error');
    const options: GetAddressOptions = {
      payload: {
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
        message: 'message',
        network: {
          type: BitcoinNetworkType.Mainnet,
        },
      },
      onFinish: () => {},
      onCancel: () => {},
    };
    await getAddress(options);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('test - console error in signMessage function', async () => {
    const spy = jest.spyOn(console, 'error');
    const options: SignMessageOptions = {
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        address: 'bc1pcphm62adk8hah900lwqmsp3l57zuafnfh7ws7vcn0r65ee7lhalqmfge3t',
        message: 'message',
      },
      onFinish: () => {},
      onCancel: () => {},
    };
    await signMessage(options);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('test - console error in signTransaction function', async () => {
    const spy = jest.spyOn(console, 'error');
    const options: SignTransactionOptions = {
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
      onFinish: () => {},
      onCancel: () => {},
    };
    await signTransaction(options);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('test - console error in sendBtcTransaction function', async () => {
    const spy = jest.spyOn(console, 'error');
    const options: SendBtcTransactionOptions = {
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
      onFinish: () => {},
      onCancel: () => {},
    };
    await sendBtcTransaction(options);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('test - console error in createInscription function', async () => {
    const spy = jest.spyOn(console, 'error');
    const options: CreateInscriptionOptions = {
      payload: {
        network: { type: BitcoinNetworkType.Mainnet },
        contentType: 'text/html',
        content: 'valid content',
        payloadType: 'PLAIN_TEXT',
      },
      onFinish: () => {},
      onCancel: () => {},
    };
    await createInscription(options);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
