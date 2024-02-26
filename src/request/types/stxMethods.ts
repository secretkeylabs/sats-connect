import { MethodParamsAndResult } from '../../types';

interface FunctionArgs {
  /**
   * An array of hex-encoded strings representing the function arguments.
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
  functionArgs: Array<string>;
}

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

interface ContractAddress {
  /**
   * The contract's Crockford base-32 encoded Stacks address.
   */
  contractAddress: string;
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
  contractName: string;
}

interface FunctionName {
  /**
   * The name of the function to call.
   */
  functionName: string;
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
   * The transaction ID of the transfer STX transaction as a hex-encoded string.
   */
  txid: string;
}

interface Transaction {
  /**
   * An STX transaction as a hex-encoded string.
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

// Types for `stx_contractCall` request
type ContractCallParams = ContractAddress &
  ContractName &
  FunctionArgs &
  FunctionName &
  Partial<AnchorMode> &
  Partial<Nonce> &
  Partial<ParameterFormatVersion> &
  Partial<PostConditionMode> &
  Partial<PostConditions> &
  Partial<Pubkey> &
  Partial<Sponsored>;
type ContractCallResult = TxId & Transaction;
export type ContractCall = MethodParamsAndResult<ContractCallParams, ContractCallResult>;

// Types for `stx_transferStx` request
type TransferStxParams = Amount &
  Recipient &
  Partial<Memo> &
  Partial<ParameterFormatVersion> &
  Partial<PostConditionMode> &
  Partial<PostConditions> &
  Partial<Pubkey>;
type TransferStxResult = TxId & Transaction;
export type TransferStx = MethodParamsAndResult<TransferStxParams, TransferStxResult>;

// Types for `stx_signMessage` request
type SignStxMessageParams = Message & Partial<Pubkey> & Partial<ParameterFormatVersion>;
type SignStxMessageResult = Signature & PublicKey;
export type SignStxMessage = MethodParamsAndResult<SignStxMessageParams, SignStxMessageResult>;

// Types for `stx_signStructuredMessage` request
type SignStructuredMessageParams = Domain &
  Message &
  Partial<ParameterFormatVersion> &
  Partial<Pubkey>;
type SignStructuredMessageResult = Signature & PublicKey;
export type SignStructuredMessage = MethodParamsAndResult<
  SignStructuredMessageParams,
  SignStructuredMessageResult
>;

// Types for `stx_contractDeploy` request
type ContractDeployParams = CodeBody &
  ContractName &
  Sponsored &
  Partial<ClarityVersion> &
  Partial<ParameterFormatVersion> &
  Partial<PostConditionMode> &
  Partial<PostConditions> &
  Partial<Pubkey>;
type ContractDeployResult = TxId & Transaction;
export type ContractDeploy = MethodParamsAndResult<ContractDeployParams, ContractDeployResult>;

// Types for `stx_getAccounts` request
type GetAccountsParams = {};
type GetAccountsResult = {
  addresses: Array<Address & PublicKey & { gaiaHubUrl: string; gaiaAppKey: string }>;
};
export type GetAccounts = MethodParamsAndResult<GetAccountsParams, GetAccountsResult>;

// Types for `stx_getAddresses` request
type GetAddressesParams = {};
type GetAddressesResult = {
  addresses: Array<Address & PublicKey>;
};
export type GetAddresses = MethodParamsAndResult<GetAddressesParams, GetAddressesResult>;

// Types for `stx_signTransaction` request
type SignTransactionParams = Transaction & Partial<Pubkey>;
type SignTransactionResult = Transaction;
export type SignTransaction = MethodParamsAndResult<SignTransactionParams, SignTransactionResult>;
