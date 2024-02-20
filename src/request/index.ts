import { getProviderById } from '../provider';

export const request = async (
  method: string,
  options: Record<string, any>,
  providerId?: string
) => {
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

  try {
    return provider.request(method, options);
  } catch (error) {
    console.error('[Connect] Error during request', error);
  }
};

export * from './types';
