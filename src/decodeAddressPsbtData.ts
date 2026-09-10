import type { Address } from '@sats-connect/core';
import { hex } from '@scure/base';
import { TaprootControlBlock } from '@scure/btc-signer';

type AddressUnlockDefinition = NonNullable<Address['unlockDefinition']>;
type TaprootControlBlockValue = ReturnType<typeof TaprootControlBlock.decode>;

export type DecodedAddressPsbtData = {
  scriptPubKey: Uint8Array;
  unlockDefinition:
    | Record<string, never>
    | { redeemScript: Uint8Array }
    | { tapInternalKey: Uint8Array }
    | { witnessScript: Uint8Array }
    | { tapLeafScript: Array<[TaprootControlBlockValue, Uint8Array]> };
};

export class DecodeAddressPsbtDataError extends Error {
  override readonly name = 'DecodeAddressPsbtDataError';
}

const malformed = (field: string, cause?: unknown): DecodeAddressPsbtDataError =>
  new DecodeAddressPsbtDataError(`${field} is malformed`, { cause });

const decodeHex = (value: unknown, field: string): Uint8Array => {
  if (typeof value !== 'string' || !/^(?:[0-9a-f]{2})+$/.test(value)) {
    throw malformed(field);
  }

  try {
    return hex.decode(value);
  } catch (error) {
    throw malformed(field, error);
  }
};

const parseUnlockDefinition = (value: unknown): AddressUnlockDefinition => {
  if (!value || typeof value !== 'object' || !('type' in value)) {
    throw malformed('unlockDefinition');
  }

  const definition = value as Record<string, unknown>;
  switch (definition.type) {
    case 'p2wpkh':
      return { type: 'p2wpkh' };
    case 'p2sh-p2wpkh':
      decodeHex(definition.redeemScript, 'redeemScript');
      return definition as AddressUnlockDefinition;
    case 'p2tr-key-path':
      if (decodeHex(definition.tapInternalKey, 'tapInternalKey').length !== 32) {
        throw malformed('tapInternalKey');
      }
      return definition as AddressUnlockDefinition;
    case 'p2wsh':
      decodeHex(definition.witnessScript, 'witnessScript');
      return definition as AddressUnlockDefinition;
    case 'p2tr-script-path': {
      if (!Array.isArray(definition.tapLeafScript) || definition.tapLeafScript.length === 0) {
        throw malformed('tapLeafScript');
      }

      for (const leaf of definition.tapLeafScript) {
        if (!leaf || typeof leaf !== 'object') throw malformed('tapLeafScript');
        const { controlBlock, script } = leaf as Record<string, unknown>;
        const controlBlockBytes = decodeHex(controlBlock, 'controlBlock');
        const scriptBytes = decodeHex(script, 'script');
        if (
          controlBlockBytes.length < 33 ||
          controlBlockBytes.length > 33 + 32 * 128 ||
          (controlBlockBytes.length - 33) % 32 !== 0
        ) {
          throw malformed('controlBlock');
        }
        if (scriptBytes.at(-1) !== (controlBlockBytes[0] & 0xfe)) {
          throw malformed('tapLeafScript');
        }
      }
      return definition as AddressUnlockDefinition;
    }
    default:
      throw malformed('unlockDefinition');
  }
};

export const decodeAddressPsbtData = (
  address: Pick<Address, 'scriptPubKey' | 'unlockDefinition'>
): DecodedAddressPsbtData => {
  if (!address || typeof address !== 'object') throw malformed('address');
  if (address.scriptPubKey === undefined || address.unlockDefinition === undefined) {
    throw new DecodeAddressPsbtDataError('scriptPubKey and unlockDefinition are required');
  }

  const scriptPubKey = decodeHex(address.scriptPubKey, 'scriptPubKey');
  const definition = parseUnlockDefinition(address.unlockDefinition);

  switch (definition.type) {
    case 'p2wpkh':
      return { scriptPubKey, unlockDefinition: {} };
    case 'p2sh-p2wpkh':
      return {
        scriptPubKey,
        unlockDefinition: { redeemScript: decodeHex(definition.redeemScript, 'redeemScript') },
      };
    case 'p2tr-key-path':
      return {
        scriptPubKey,
        unlockDefinition: {
          tapInternalKey: decodeHex(definition.tapInternalKey, 'tapInternalKey'),
        },
      };
    case 'p2wsh':
      return {
        scriptPubKey,
        unlockDefinition: {
          witnessScript: decodeHex(definition.witnessScript, 'witnessScript'),
        },
      };
    case 'p2tr-script-path':
      try {
        return {
          scriptPubKey,
          unlockDefinition: {
            tapLeafScript: definition.tapLeafScript.map(({ controlBlock, script }) => [
              TaprootControlBlock.decode(decodeHex(controlBlock, 'controlBlock')),
              decodeHex(script, 'script'),
            ]),
          },
        };
      } catch (error) {
        if (error instanceof DecodeAddressPsbtDataError) throw error;
        throw malformed('controlBlock', error);
      }
  }
};
