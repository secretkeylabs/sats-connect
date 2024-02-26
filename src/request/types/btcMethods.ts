import { Address, AddressPurpose } from '../../addresses';
import { MethodParamsAndResult } from '../../types';

type GetInfoResult = {
  version: Number | String;
  methods?: Array<string>;
  supports?: Array<string>;
};

export type GetInfo = MethodParamsAndResult<null, GetInfoResult>;

type GetAddressesParams = {
  purposes: AddressPurpose[];
  message?: string;
};

type GetAddressesResult = {
  addresses: Address[];
};

export type GetAddresses = MethodParamsAndResult<GetAddressesParams, GetAddressesResult>;

type SignMessageParams = {
  address: string;
  message: string;
};
type SignMessageResult = {
  signature: string;
  messageHash: string;
  address: string;
};

export type SignMessage = MethodParamsAndResult<SignMessageParams, SignMessageResult>;

type Recipient = {
  address: string;
  amount: bigint;
};

type SendTransferParams = {
  recipients: Recipient[];
};
type SendTransferResult = {
  txid: string;
};

export type SendTransfer = MethodParamsAndResult<SendTransferParams, SendTransferResult>;

type SignInputsByAddress = {
  [address: string]: number[];
};

export type SignPsbtParams = {
  psbt: string;
  signInputs: number[] | SignInputsByAddress;
  allowedSignHash: number;
  broadcast?: boolean;
};

export type SignPsbtResult = {
  psbt: string;
  txid?: string;
};

export type SignPsbt = MethodParamsAndResult<SendTransferParams, SendTransferResult>;
