import { getProviderById } from '../provider';
import { Request } from './types/requests';

export const request: Request = async (method, params, providerId?: string) => {
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
