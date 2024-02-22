export type RpcId = string | number | null | undefined;

export interface RpcBase {
  jsonrpc: '2.0';
  id: RpcId;
}
export interface RpcRequest<T extends string, U> extends RpcBase {
  method: T;
  params: U;
}

export enum RpcErrorCode {
  PARSE_ERROR = -32700, // Parse error Invalid JSON
  INVALID_REQUEST = -32600, // The JSON sent is not a valid Request object.
  METHOD_NOT_FOUND = -32601, // The method does not exist/is not available.
  INVALID_PARAMS = -32602, // Invalid method parameter(s)
  INTERNAL_ERROR = -32603, // Internal JSON-RPC error
  USER_REJECTION = -32000, // user rejected/canceled the request
  METHOD_NOT_SUPPORTED = -32001, // method is not supported for the address provided
}

export interface RpcError extends RpcBase {
  code: number | RpcErrorCode;
  message: string;
}

export interface RpcErrorResponse<TError extends RpcError = RpcError> {
  error: TError;
}

export interface Method<T, U> {
  request: T;
  response: U;
}

export type Methods = Record<string, Method<any, any>>;

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
  pubkey?: string;
}

interface ContractAddress {
  /**
   * The Crockford base-32 encoded Stacks address of the contract.
   */
  contractAddress: string;
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
   */
  postConditions: Array<string>;
}

interface PostConditionMode {
  /**
   * The mode of the post conditions.
   */
  postConditionMode?: number;
}

interface AnchorMode {
  /**
   * The anchor mode.
   */
  anchorMode?: 'TODO'; // AnchorMode
}

interface Nonce {
  /**
   * A number in string format.
   */
  nonce?: string; // BigInt
}

interface ParameterFormatVersion {
  /**
   * Version of parameter format.
   */
  version?: string;
}

interface Sponsored {
  /**
   * Whether the transaction is sponsored.
   */
  sponsored?: boolean;
}

interface Recipient {
  /**
   * The Crockford base-32 encoded Stacks address of the recipient.
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
  memo?: string;
}

interface TxId {
  /**
   * The transaction ID of the transfer STX transaction as a hex-encoded string.
   */
  txid: string;
}

interface Transaction {
  /**
   * The transaction of the transfer STX transaction as a hex-encoded string.
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
   * Public key of the signer.
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

export interface Requests {
  stx_contractCall: {
    params: Pubkey &
      FunctionArgs &
      ContractAddress &
      ContractName &
      FunctionName &
      PostConditions &
      PostConditionMode &
      AnchorMode &
      Nonce &
      ParameterFormatVersion &
      Sponsored;
    result: TxId & Transaction;
  };
  stx_transferStx: {
    params: Pubkey &
      Recipient &
      Amount &
      Memo &
      PostConditions &
      PostConditionMode &
      ParameterFormatVersion;
    result: TxId & Transaction;
  };
  stx_signMessage: {
    params: Pubkey & ParameterFormatVersion & Message;
    result: Signature & PublicKey;
  };
  stx_signStructuredMessage: {
    params: Pubkey & ParameterFormatVersion & Domain & Message;
    result: Signature & PublicKey;
  };
  stx_contractDeploy: {
    params: Pubkey &
      ParameterFormatVersion &
      ContractName &
      CodeBody &
      PostConditions &
      PostConditionMode &
      Sponsored &
      ClarityVersion;
    result: TxId & Transaction;
  };
}

export type Return<Method> = Method extends keyof Requests ? Requests[Method]['result'] : unknown;
export type Params<Method> = Method extends keyof Requests ? Requests[Method]['params'] : unknown;

export type Request<Method extends keyof Requests | string> = (
  requestMethod: Method,
  args: Params<Method>
) => Return<Method>;
