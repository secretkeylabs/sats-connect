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

interface Requests {
  stx_contractCall: {
    args: {
      /**
       * The stacks address of sender.
       */
      pubkey: string;

      /**
       * The address of the contract.
       */
      contractAddress: string;

      /**
       * The name of the contract.
       */
      contractName: string;

      /**
       * The name of the function to call.
       */
      functionName: string;

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
      postConditions: Array<string>; // Array<PostCondition>

      /**
       * The mode of the post conditions.
       */
      postConditionMode?: number; // PostConditionMode

      /**
       * The anchor mode.
       */
      anchorMode?: 'TODO'; // AnchorMode
      /** A stringified BigInt */
      nonce?: string; // BigInt
      version?: string;
      sponsored?: boolean;
    };
    return: {};
  };
  stx_transfer: {
    args: {
      pubkey: string;
      recipient: string;
      amount: string; // BigInt
      memo?: string;
      postConditions?: Array<string>; // Array<PostCond>
      postConditionMode?: string; // PostConditionMode
      version?: string;
    };
    return: {};
  };
  stx_signMessage: {
    args: {
      pubkey: string;
      message: string;
      version?: string;
    };
    return: {};
  };
  stx_contractDeploy: {
    args: {
      pubkey: string;
      contractName: string;
      codeBody: string;
      postConditions?: Array<string>; // Array<PostCond>
      postConditionMode?: string; // PostConditionMode
      version?: string;
    };
    return: {};
  };
}

type Return<Method> = Method extends keyof Requests ? Requests[Method]['return'] : unknown;
type Args<Method> = Method extends keyof Requests ? Requests[Method]['args'] : unknown;

export type Request<Method extends keyof Requests> = (requestMethod: Method, args: Args<Method>) => Return<Method>;
