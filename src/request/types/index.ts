import { RpcSuccessResponse } from 'src/types';
import { GetAddresses, GetInfo, SendTransfer, SignMessage, SignPsbt } from './btcMethods';
import {
  StxContractCall,
  StxContractDeploy,
  StxGetAccounts,
  StxSignStructuredMessage,
  StxSignStxMessage,
  StxSignTransaction,
  StxTransferStx,
  StxGetAddresses,
} from './stxMethods';

export interface StxRequests {
  stx_contractCall: StxContractCall;
  stx_transferStx: StxTransferStx;
  stx_signMessage: StxSignStxMessage;
  stx_signStructuredMessage: StxSignStructuredMessage;
  stx_contractDeploy: StxContractDeploy;
  stx_signTransaction: StxSignTransaction;
  stx_getAccounts: StxGetAccounts;
  stx_getAddresses: StxGetAddresses;
}

export type StxRequestMethod = keyof StxRequests;

export interface BtcRequests {
  getInfo: GetInfo;
  getAddresses: GetAddresses;
  signMessage: SignMessage;
  sendTransfer: SendTransfer;
  signPsbt: SignPsbt;
}

export type BtcRequestMethod = keyof BtcRequests;

export type Requests = BtcRequests & StxRequests;

export type Return<Method> = Method extends keyof Requests ? Requests[Method]['result'] : unknown;
export type Params<Method> = Method extends keyof Requests ? Requests[Method]['params'] : unknown;

export type Request<Method extends keyof Requests> = (
  requestMethod: Method,
  param?: Params<Method>
) => Promise<RpcSuccessResponse<Method>>;

export * from './stxMethods';
export * from './btcMethods';
