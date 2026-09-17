import type { Address } from '@sats-connect/core';
import { DecodeAddressPsbtDataError, decodeAddressPsbtData } from '../src/decodeAddressPsbtData';

type AddressPsbtData = Pick<Address, 'scriptPubKey' | 'unlockDefinition'>;

const bytes = (...values: number[]) => Uint8Array.from(values);
const scriptPubKey = '0014' + '11'.repeat(20);
const internalKey = '22'.repeat(32);

const decodeUnknown = (address: unknown) => decodeAddressPsbtData(address as AddressPsbtData);

describe('decodeAddressPsbtData', () => {
  it('decodes p2wpkh data', () => {
    expect(decodeAddressPsbtData({ scriptPubKey, unlockDefinition: { type: 'p2wpkh' } })).toEqual({
      scriptPubKey: bytes(0x00, 0x14, ...Array(20).fill(0x11)),
      unlockDefinition: {},
    });
  });

  it('decodes p2sh-p2wpkh data', () => {
    const redeemScript = '0014' + '33'.repeat(20);

    expect(
      decodeAddressPsbtData({
        scriptPubKey,
        unlockDefinition: { type: 'p2sh-p2wpkh', redeemScript },
      })
    ).toEqual({
      scriptPubKey: bytes(0x00, 0x14, ...Array(20).fill(0x11)),
      unlockDefinition: {
        redeemScript: bytes(0x00, 0x14, ...Array(20).fill(0x33)),
      },
    });
  });

  it('decodes p2tr key-path data', () => {
    expect(
      decodeAddressPsbtData({
        scriptPubKey,
        unlockDefinition: { type: 'p2tr-key-path', tapInternalKey: internalKey },
      })
    ).toEqual({
      scriptPubKey: bytes(0x00, 0x14, ...Array(20).fill(0x11)),
      unlockDefinition: { tapInternalKey: bytes(...Array(32).fill(0x22)) },
    });
  });

  it('decodes p2wsh data', () => {
    expect(
      decodeAddressPsbtData({
        scriptPubKey,
        unlockDefinition: { type: 'p2wsh', witnessScript: '5121' },
      })
    ).toEqual({
      scriptPubKey: bytes(0x00, 0x14, ...Array(20).fill(0x11)),
      unlockDefinition: { witnessScript: bytes(0x51, 0x21) },
    });
  });

  it('decodes p2tr script-path data into control-block tuples', () => {
    const controlBlock = 'c0' + internalKey + '44'.repeat(32);

    expect(
      decodeAddressPsbtData({
        scriptPubKey,
        unlockDefinition: {
          type: 'p2tr-script-path',
          tapLeafScript: [{ controlBlock, script: '51c0' }],
        },
      })
    ).toEqual({
      scriptPubKey: bytes(0x00, 0x14, ...Array(20).fill(0x11)),
      unlockDefinition: {
        tapLeafScript: [
          [
            {
              version: 0xc0,
              internalKey: bytes(...Array(32).fill(0x22)),
              merklePath: [bytes(...Array(32).fill(0x44))],
            },
            bytes(0x51, 0xc0),
          ],
        ],
      },
    });
  });

  it('throws a typed error when metadata is absent', () => {
    expect(() => decodeUnknown({})).toThrow(DecodeAddressPsbtDataError);
  });

  it('throws a typed error for malformed hex', () => {
    expect(() =>
      decodeUnknown({ scriptPubKey: '0x0014', unlockDefinition: { type: 'p2wpkh' } })
    ).toThrow(DecodeAddressPsbtDataError);
  });

  it('throws a typed error for a wrong-length tapInternalKey', () => {
    expect(() =>
      decodeUnknown({
        scriptPubKey,
        unlockDefinition: { type: 'p2tr-key-path', tapInternalKey: '22'.repeat(31) },
      })
    ).toThrow(DecodeAddressPsbtDataError);
  });

  it('throws a typed error for a bad control-block length', () => {
    expect(() =>
      decodeUnknown({
        scriptPubKey,
        unlockDefinition: {
          type: 'p2tr-script-path',
          tapLeafScript: [{ controlBlock: 'c0' + internalKey + '44', script: '51c0' }],
        },
      })
    ).toThrow(DecodeAddressPsbtDataError);
  });

  it('returns fresh objects and byte arrays', () => {
    const address: AddressPsbtData = {
      scriptPubKey,
      unlockDefinition: { type: 'p2tr-key-path', tapInternalKey: internalKey },
    };
    const first = decodeAddressPsbtData(address);
    const second = decodeAddressPsbtData(address);

    first.scriptPubKey[0] = 0xff;
    if ('tapInternalKey' in first.unlockDefinition) {
      first.unlockDefinition.tapInternalKey[0] = 0xff;
    }

    expect(first).not.toBe(second);
    expect(first.unlockDefinition).not.toBe(second.unlockDefinition);
    expect(second.scriptPubKey[0]).toBe(0x00);
    expect(
      'tapInternalKey' in second.unlockDefinition && second.unlockDefinition.tapInternalKey[0]
    ).toBe(0x22);
  });
});
