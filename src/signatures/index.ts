import { createUnsecuredToken, Json } from 'jsontokens';
import { SignMessageOptions } from './types';

export const signMessage = async (options: SignMessageOptions) => {
  const provider = window.BitcoinProvider;
  if (!provider) {
    throw new Error('No Bitcoin Wallet installed');
  }
  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const response  = await provider.signMessage(request);
    options.onFinish?.(response);
  } catch (error) {
    console.error('[Connect] Error during Signing request', error);
    options.onCancel?.();
  }
};

export * from './types';
