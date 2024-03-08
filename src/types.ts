import type { BitcoinProvider } from './provider';
import { Requests, Return } from './request';

export enum BitcoinNetworkType {
  Mainnet = 'Mainnet',
  Testnet = 'Testnet',
}

export interface BitcoinNetwork {
  type: BitcoinNetworkType;
  address?: string;
}

export interface RequestPayload {
  network: BitcoinNetwork;
}

export interface RequestOptions<Payload extends RequestPayload, Response> {
  onFinish: (response: Response) => void;
  onCancel: () => void;
  payload: Payload;
  getProvider?: () => Promise<BitcoinProvider | undefined>;
}

// RPC Request and Response types

export type RpcId = string | null;

export interface RpcBase {
  jsonrpc: '2.0';
  id: RpcId;
}
export interface RpcRequest<T extends string, U> extends RpcBase {
  method: T;
  params: U;
}

export interface MethodParamsAndResult<TParams, TResult> {
  params: TParams;
  result: TResult;
}

/**
 * @enum {number} RpcErrorCode
 * @description JSON-RPC error codes
 * @see https://www.jsonrpc.org/specification#error_object
 */
export enum RpcErrorCode {
  /**
   * Parse error Invalid JSON
   **/
  PARSE_ERROR = -32700,
  /**
   * The JSON sent is not a valid Request object.
   **/
  INVALID_REQUEST = -32600,
  /**
   * The method does not exist/is not available.
   **/
  METHOD_NOT_FOUND = -32601,
  /**
   * Invalid method parameter(s).
   */
  INVALID_PARAMS = -32602,
  /**
   * Internal JSON-RPC error.
   * This is a generic error, used when the server encounters an error in performing the request.
   **/
  INTERNAL_ERROR = -32603,
  /**
   * user rejected/canceled the request
   */
  USER_REJECTION = -32000,
  /**
   * method is not supported for the address provided
   */
  METHOD_NOT_SUPPORTED = -32001,
}

export interface RpcError {
  code: number | RpcErrorCode;
  message: string;
  data?: any;
}

export interface RpcErrorResponse<TError extends RpcError = RpcError> extends RpcBase {
  error: TError;
}

export interface RpcSuccessResponse<Method extends keyof Requests> extends RpcBase {
  result: Return<Method>;
}

export type RpcResponse<Method extends keyof Requests> =
  | RpcSuccessResponse<Method>
  | RpcErrorResponse;

export type RpcResult<Method extends keyof Requests> =
  | {
      result: RpcSuccessResponse<Method>['result'];
      status: 'success';
    }
  | {
      error: RpcErrorResponse['error'];
      status: 'error';
    };
