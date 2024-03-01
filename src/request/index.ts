import { RpcResponse } from '../types';
import { getProviderById } from '../provider';
import { Params, Requests } from './types';

export const request = async <Method extends keyof Requests>(
  method: Method,
  params: Params<Method>,
  providerId?: string
): Promise<RpcResponse<Method>> => {
  let provider = window.XverseProviders?.BitcoinProvider;
  if (providerId) {
    provider = await getProviderById(providerId);
  }
  if (!provider) {
    throw new Error('no wallet provider was found');
  }
  if (!method) {
    throw new Error('A wallet method is required');
  }

  return provider.request(method, params);
};

export * from './types';