import { AddressPurpose } from '../src/addresses/types';

export const data = {
  callResponse: { result: 'dummy result' },
  connectResponse: {
    addresses: [
      {
        address: 'dummy addresss',
        publicKey: 'dummy publicKey',
        purpose: AddressPurpose.Ordinals,
      },
    ],
  },
  signMessageResponse: 'dummy message',
  signTransactionResponse: {
    psbtBase64: 'dummy psbtBase64',
    txId: 'dummy txId',
  },
  sendBtcTransactionResponse: 'dummy transaction',
  createInscriptionResponse: {
    txId: 'dummy txId',
  },
};
