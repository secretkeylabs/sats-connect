import { MethodParamsAndResult } from '../../types';

interface Pubkey {
  /**
   * When sending a transfer STX request to a wallet, users can generally
   * choose from which accout they want to send the STX tokens from. In
   * cases where applications want the transfer to be made from a specific
   * account, they can provide the `pubkey` of the address they'd like the
   * transfer to be made from. It is up to wallet providers to handle this
   * field as they see fit.
   */
  pubkey: string;
}

interface Address {
  /**
   * A Crockford base-32 encoded Stacks address.
   */
  address: string;
}

interface ContractName {
  /**
   * The name of the contract.
   */
  contract: string;
}

interface PostConditions {
  /**
   * A hex-encoded string representing the post conditions.
   *
   * A post condition may be converted to it's hex representation using the `serializePostCondition` helper from the `@stacks/transactions` package,
   *
   * ```js
   * import { serializePostCondition } from '@stacks/transactions';
   *
   * const postCondition = somePostCondition;
   * const hexPostCondition = serializePostCondition(postCondition).toString('hex');
   * ```
   */
  postConditions: Array<string>;
}

interface PostConditionMode {
  /**
   * The mode of the post conditions.
   */
  postConditionMode: number;
}

interface AnchorMode {
  /**
   * The anchor mode.
   */
  anchorMode: 'TODO'; // AnchorMode
}

interface Nonce {
  /**
   * A number in string format.
   */
  nonce: string; // BigInt
}

interface ParameterFormatVersion {
  /**
   * Version of parameter format.
   */
  version: string;
}

interface Sponsored {
  /**
   * Whether the transaction is sponsored.
   */
  sponsored: boolean;
}

interface Recipient {
  /**
   * The recipeint's Crockford base-32 encoded Stacks address.
   */
  recipient: string;
}

interface Amount {
  /**
   * Amount of STX tokens to transfer in microstacks as a string. Anything
   * parseable by `BigInt` is acceptable.
   *
   * Example,
   *
   * ```js
   * const amount1 = 1234;
   * const amount2 = 1234n;
   * const amount3 = '1234';
   * ```
   */
  amount: number | string;
}

interface Memo {
  /**
   * A string representing the memo.
   */
  memo: string;
}

interface TxId {
  /**
   * The ID of the transaction.
   */
  txid: string;
}

interface Transaction {
  /**
   * A Stacks transaction as a hex-encoded string.
   */
  transaction: string;
}

interface Message {
  /**
   * Message payload to be signed.
   */
  message: string;
}

interface Signature {
  /**
   * Signature of the message.
   */
  signature: string;
}

interface PublicKey {
  /**
   * Public key as hex-encoded string.
   */
  publicKey: string;
}

interface Domain {
  /**
   * The domain to be signed.
   */
  domain: string;
}

interface CodeBody {
  /**
   * The code body of the Clarity contract.
   */
  codeBody: string;
}

interface ClarityVersion {
  /**
   * The Clarity version of the contract.
   */
  clarityVersion?: string;
}

// Types for `stx_callContract` request
export interface CallContractParams {
  /**
   * The contract's Crockford base-32 encoded Stacks address and name.
   *
   * E.g. `"SPKE...GD5C.my-contract"`
   */
  contract: string;

  /**
   * The name of the function to call.
   *
   * Note: spec changes ongoing,
   * https://github.com/stacksgov/sips/pull/166#pullrequestreview-1914236999
   */
  functionName: string;

  /**
   * The function's arguments. The arguments are expected to be hex-encoded
   * strings of Clarity values.
   *
   * To convert Clarity values to their hex representation, the `cvToString`
   * helper from the `@stacks/transactions` package may be helpful.
   *
   * ```js
   * import { cvToString } from '@stacks/transactions';
   *
   * const functionArgs = [someClarityValue1, someClarityValue2];
   * const hexArgs = functionArgs.map(cvToString);
   * ```
   */
  arguments?: Array<string>;
}
export type CallContractResult = TxId & Transaction;
export type StxCallContract = MethodParamsAndResult<CallContractParams, CallContractResult>;

// Types for `stx_transferStx` request
export type TransferStxParams = Amount &
  Recipient &
  Partial<Memo> &
  Partial<ParameterFormatVersion> &
  Partial<PostConditionMode> &
  Partial<PostConditions> &
  Partial<Pubkey>;
export type TransferStxResult = TxId & Transaction;
export type StxTransferStx = MethodParamsAndResult<TransferStxParams, TransferStxResult>;

// Types for `stx_signMessage` request
export type SignStxMessageParams = Message & Partial<Pubkey> & Partial<ParameterFormatVersion>;
export type SignStxMessageResult = Signature & PublicKey;
export type StxSignStxMessage = MethodParamsAndResult<SignStxMessageParams, SignStxMessageResult>;

// Types for `stx_signStructuredMessage` request
type SignStructuredMessageParams = Domain &
  Message &
  Partial<ParameterFormatVersion> &
  Partial<Pubkey>;
export type SignStructuredMessageResult = Signature & PublicKey;
export type StxSignStructuredMessage = MethodParamsAndResult<
  SignStructuredMessageParams,
  SignStructuredMessageResult
>;

// Types for `stx_deployContract` request
export interface DeployContractParams {
  /**
   * Name of the contract.
   */
  name: string;

  /**
   * The code of the Clarity contract.
   */
  clarityCode: string;

  /**
   * The version of the Clarity contract.
   */
  clarityVersion?: string;
}
export type DeployContractResult = TxId & Transaction;
export type StxDeployContract = MethodParamsAndResult<DeployContractParams, DeployContractResult>;

// Types for `stx_getAccounts` request
export type GetAccountsResult = {
  addresses: Array<Address & PublicKey & { gaiaHubUrl: string; gaiaAppKey: string }>;
};
export type StxGetAccounts = MethodParamsAndResult<{}, GetAccountsResult>;

// Types for `stx_getAddresses` request
export type GetAddressesParams = undefined | null;
export type GetAddressesResult = {
  addresses: Array<Address & PublicKey>;
};
export type StxGetAddresses = MethodParamsAndResult<GetAddressesParams, GetAddressesResult>;

// Types for `stx_signTransaction` request
export type SignTransactionParams = Transaction & Partial<Pubkey>;
export type SignTransactionResult = Transaction;
export type StxSignTransaction = MethodParamsAndResult<
  SignTransactionParams,
  SignTransactionResult
>;
