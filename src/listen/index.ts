import { getProviderById } from '../provider';

export const listen = async (method: string, callback: () => void, providerId?: string) => {
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
  return provider.listen(method, callback);
};
