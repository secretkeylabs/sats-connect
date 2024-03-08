import { getProviderById } from '../provider';
import { RpcBase, RpcResult, RpcSuccessResponse } from '../types';
import { Params, Requests } from './types';

export const request = async <Method extends keyof Requests>(
  method: Method,
  params: Params<Method>,
  providerId?: string
): Promise<RpcResult<Method>> => {
  let provider = window.XverseProviders?.BitcoinProvider || window.BitcoinProvider;
  if (providerId) {
    provider = await getProviderById(providerId);
  }
  if (!provider) {
    throw new Error('no wallet provider was found');
  }
  if (!method) {
    throw new Error('A wallet method is required');
  }

  const response = await provider.request(method, params);

  if (isRpcSuccessResponse<Method>(response)) {
    return {
      status: 'success',
      result: response.result,
    };
  }

  return {
    status: 'error',
    error: response.error,
  };
};

const isRpcSuccessResponse = <Method extends keyof Requests>(
  response: RpcBase
): response is RpcSuccessResponse<Method> => {
  return Object.hasOwn(response, 'result') && !!(response as RpcSuccessResponse<Method>).result;
};

export * from './types';
