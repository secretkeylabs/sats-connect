/**
 * Represents the types and interfaces related to BTC methods.
 */

import { Address, AddressPurpose } from '../../addresses';
import { MethodParamsAndResult } from '../../types';

type GetInfoResult = {
  version: number | string;
  methods?: Array<string>;
  supports?: Array<string>;
};

export type GetInfo = MethodParamsAndResult<null, GetInfoResult>;

type GetAddressesParams = {
  /**
   * The purposes for which to generate addresses.
   * possible values are "payment", "ordinals", ...
   */
  purposes: Array<AddressPurpose>;
  /**
   * a message to be displayed to the user in the request prompt.
   */
  message?: string;
};

/**
 * The addresses generated for the given purposes.
 */
type GetAddressesResult = {
  addresses: Array<Address>;
};

export type GetAddresses = MethodParamsAndResult<GetAddressesParams, GetAddressesResult>;

type SignMessageParams = {
  /**
   * The address used for signing.
   **/
  address: string;
  /**
   * The message to sign.
   **/
  message: string;
};

type SignMessageResult = {
  /**
   * The signature of the message.
   */
  signature: string;
  /**
   * hash of the message.
   */
  messageHash: string;
  /**
   * The address used for signing.
   */
  address: string;
};

export type SignMessage = MethodParamsAndResult<SignMessageParams, SignMessageResult>;

type Recipient = {
  /**
   * The recipient's address.
   **/
  address: string;
  /**
   * The amount to send to the recipient in satoshis.
   */
  amount: number;
};

type SendTransferParams = {
  /**
   * Array of recipients to send to.
   * The amount to send to each recipient is in satoshis.
   */
  recipients: Array<Recipient>;
};
type SendTransferResult = {
  /**
   * The transaction id as a hex-encoded string.
   */
  txid: string;
};

export type SendTransfer = MethodParamsAndResult<SendTransferParams, SendTransferResult>;

export type SignPsbtParams = {
  /**
   * The base64 encoded PSBT to sign.
   */
  psbt: string;
  /**
   * The inputs to sign.
   * The key is the address and the value is an array of indexes of the inputs to sign.
   */
  signInputs: Record<string, number[]>;
  /**
   * the sigHash type to use for signing.
   * will default to the sighash type of the input if not provided.
   **/
  allowedSignHash?: number;
  /**
   * Whether to broadcast the transaction after signing.
   **/
  broadcast?: boolean;
};

export type SignPsbtResult = {
  /**
   * The base64 encoded PSBT after signing.
   */
  psbt: string;
  /**
   * The transaction id as a hex-encoded string.
   * This is only returned if the transaction was broadcast.
   **/
  txid?: string;
};

export type SignPsbt = MethodParamsAndResult<SignPsbtParams, SignPsbtResult>;

export type GetAccountsParams = {
  /**
   * a message to be displayed to the user in the request prompt.
   */
  message?: string;
};

export type GetAccountResult = Address[];

export type GetAccounts = MethodParamsAndResult<GetAccountsParams, GetAccountResult>;
