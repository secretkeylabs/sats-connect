import { getProviderOrThrow } from '../provider';

export const listen = async (method: string, options: Record<string, any>) => {
  const provider = await getProviderOrThrow(options.getProvider);

  if (!method) {
    throw new Error('A wallet method is required');
  }

  try {
    return provider.listen(method, options.callback);
  } catch (error) {
    console.error('[Connect] Error during listen request', error);
  }
};
