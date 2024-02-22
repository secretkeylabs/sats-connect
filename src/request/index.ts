import { getProviderById } from '../provider';
import { Params, Request, Requests, Return } from './types';

export const request = async <Method extends keyof Requests>(
  method: Method,
  options: Params<Method>,
  providerId?: string
): Promise<Return<Method>> => {
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

  return provider.request(method, options);
};

export * from './types';
