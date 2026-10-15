import { type Address, unlockDefinitionSchema } from '@sats-connect/core';
import { hex } from '@scure/base';
import { TaprootControlBlock } from '@scure/btc-signer';
import * as v from 'valibot';

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
  const result = v.safeParse(unlockDefinitionSchema, value);
  if (!result.success) throw malformed('unlockDefinition', result.issues);
  return result.output;
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
