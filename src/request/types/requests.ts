import { Address, AddressPurpose } from '../../addresses';
import { InputToSign, SendBtcTransactionPayload } from '../../transactions';

export interface Requests {
  getInfo: {
    params: null;
    result: {
      version: Number | String;
      methods?: Array<string>;
      supports?: Array<string>;
    };
  };
  getAddresses: {
    params: {
      purposes: AddressPurpose[];
      message?: string;
    };
    result: {
      addresses: Address[];
    };
  };
  signMessage: {
    params: {
      address: string;
      message: string;
    };
    result: {
      signature: string;
      messageHash: string;
      address: string;
    };
  };
  sendTransfer: {
    params: SendBtcTransactionPayload;
    result: {
      txid: string;
    };
  };
  signPsbt: {
    params: {
      psbt: string;
      signInputs: InputToSign[];
      broadcast?: boolean;
    };
    result: {
      txid?: string;
      psbt?: string;
    };
  };
  stx_contractCall: ContractCall;
  stx_transferStx: TransferStx;
  stx_signMessage: SignMessage;
  stx_signStructuredMessage: SignStructuredMessage;
  stx_contractDeploy: ContractDeploy;
  stx_signTransaction: SignTransaction;
}

export type Return<Method> = Method extends keyof Requests ? Requests[Method]['result'] : unknown;
export type Params<Method> = Method extends keyof Requests ? Requests[Method]['params'] : unknown;

export type Request<Method extends keyof Requests | string> = (
  requestMethod: Method,
  params: Params<Method>
) => Return<Method>;
