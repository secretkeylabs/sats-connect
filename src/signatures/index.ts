import { createUnsecuredToken, Json } from 'jsontokens';
import { SignMessageOptions } from './types';

export const signMessage = async (options: SignMessageOptions) => {
  const {address, message} = options.payload;
  const provider = window.BitcoinProvider;
  if (!provider) {
    throw new Error('No Bitcoin Wallet installed');
  }
  if(!address) {
    throw new Error("An Address is required to sign a message");
  }
  if (!message) {
    throw new Error('you need to provide a message to be signed');
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
