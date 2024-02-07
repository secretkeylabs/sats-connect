import { getProviderOrThrow } from '../provider';

export const request = async (method: string, options: Record<string, any>) => {
  const provider = await getProviderOrThrow(options.getProvider);

  if (!method) {
    throw new Error('A wallet method is required');
  }

  try {
    return await provider.request(method, options);
  } catch (error) {
    console.error('[Connect] Error during call request', error);
  }
};
