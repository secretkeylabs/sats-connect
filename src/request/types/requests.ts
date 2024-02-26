import { GetAddresses, GetInfo, SendTransfer, SignMessage, SignPsbt } from './btc';
import {
  ContractCall,
  ContractDeploy,
  SignStructuredMessage,
  SignStxMessage,
  SignTransaction,
  TransferStx,
} from './stx';

export interface Requests {
  getInfo: GetInfo;
  getAddresses: GetAddresses;
  signMessage: SignMessage;
  sendTransfer: SendTransfer;
  signPsbt: SignPsbt;
  stx_contractCall: ContractCall;
  stx_transferStx: TransferStx;
  stx_signMessage: SignStxMessage;
  stx_signStructuredMessage: SignStructuredMessage;
  stx_contractDeploy: ContractDeploy;
  stx_signTransaction: SignTransaction;
}

export type Return<Method> = Method extends keyof Requests ? Requests[Method]['result'] : unknown;
export type Params<Method> = Method extends keyof Requests ? Requests[Method]['params'] : unknown;

export type Request = <Method extends keyof Requests>(
  requestMethod: Method,
  params: Params<Method>
) => Promise<Return<Method>>;
