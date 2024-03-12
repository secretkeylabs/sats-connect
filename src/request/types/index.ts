import {
  GetAccounts,
  GetAddresses,
  GetInfo,
  SendTransfer,
  SignMessage,
  SignPsbt,
} from './btcMethods';
import {
  StxCallContract,
  StxDeployContract,
  StxGetAccounts,
  StxGetAddresses,
  StxSignStructuredMessage,
  StxSignStxMessage,
  StxSignTransaction,
  StxTransferStx,
} from './stxMethods';

export interface StxRequests {
  stx_callContract: StxCallContract;
  stx_deployContract: StxDeployContract;
  stx_getAccounts: StxGetAccounts;
  stx_getAddresses: StxGetAddresses;
  stx_signMessage: StxSignStxMessage;
  stx_signStructuredMessage: StxSignStructuredMessage;
  stx_signTransaction: StxSignTransaction;
  stx_transferStx: StxTransferStx;
}

export type StxRequestMethod = keyof StxRequests;

export interface BtcRequests {
  getInfo: GetInfo;
  getAddresses: GetAddresses;
  getAccounts: GetAccounts;
  signMessage: SignMessage;
  sendTransfer: SendTransfer;
  signPsbt: SignPsbt;
}

export type BtcRequestMethod = keyof BtcRequests;

export type Requests = BtcRequests & StxRequests;

export type Return<Method> = Method extends keyof Requests ? Requests[Method]['result'] : never;
export type Params<Method> = Method extends keyof Requests ? Requests[Method]['params'] : never;

export * from './stxMethods';
export * from './btcMethods';
