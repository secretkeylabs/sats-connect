import type { Json } from 'jsontokens';
import { createUnsecuredToken } from 'jsontokens';

import { BitcoinProvider, Capability, getProviderOrThrow } from '../provider';
import type { GetCapabilitiesOptions } from './types';

// we use this type in order for the build to fail if a new capability is added
// but the extract capabilities method is not updated
type CapabilityMap = {
  [capabilityKey in keyof Omit<BitcoinProvider, 'getCapabilities'>]: boolean;
};

const extractOrValidateCapabilities = (
  provider: BitcoinProvider,
  reportedCapabilities?: Set<Capability>
): Capability[] => {
  const validateCapability = (capability: Capability) => {
    if (!provider[capability]) {
      return false;
    }

    // The provider might have the method implemented but not ready for use
    if (reportedCapabilities && !reportedCapabilities.has(capability)) {
      return false;
    }

    return true;
  };

  const capabilityMap: CapabilityMap = {
    call: validateCapability('call'),
    connect: validateCapability('connect'),
    signMessage: validateCapability('signMessage'),
    signTransaction: validateCapability('signTransaction'),
    sendBtcTransaction: validateCapability('sendBtcTransaction'),
    createInscription: validateCapability('createInscription'),
  };

  return Object.entries(capabilityMap).reduce((acc, [capability, value]) => {
    if (value) return [...acc, capability as Capability];
    return acc;
  }, [] as Capability[]);
};

export const getCapabilities = async (options: GetCapabilitiesOptions) => {
  const provider = await getProviderOrThrow(options.getProvider);

  const request = createUnsecuredToken(options.payload as unknown as Json);

  if (provider.getCapabilities) {
    try {
      const response = await provider.getCapabilities(request);

      options.onFinish?.(extractOrValidateCapabilities(provider, new Set(response)));
    } catch (error) {
      console.error('[Connect] Error during capabilities request', error);
    }
  }

  try {
    const inferredCapabilities = extractOrValidateCapabilities(provider);
    options.onFinish?.(inferredCapabilities);
  } catch (error) {
    console.error('[Connect] Error during capabilities request', error);
    options.onCancel?.();
  }
};

export * from './types';
