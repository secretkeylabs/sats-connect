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
