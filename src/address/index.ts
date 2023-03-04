import { GetAddressOptions } from './types';

export const openRequestAddressPopup = async (options: GetAddressOptions) => {
  const { message, network, purpose } = options.payload;
  const provider = window.BitcoinProvider;
  if (!provider) {
    throw new Error('No Bitcoin Wallet installed');
  }
  try {
    const addressResponse = await provider.getAddress(purpose, message, network);
    options.onFinish?.(addressResponse);
  } catch (error) {
    console.error('[Connect] Error during address request', error);
    options.onCancel?.();
  }
};

export * from './types';
