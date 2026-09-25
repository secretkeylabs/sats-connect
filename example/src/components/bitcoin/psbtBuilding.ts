import { hex } from '@scure/base';
import {
  Address as BitcoinAddress,
  NETWORK,
  OutScript,
  p2wpkh,
  TaprootControlBlock,
  TEST_NETWORK,
} from '@scure/btc-signer';
import {
  Address,
  AddressType,
  BitcoinNetworkType,
  decodeAddressPsbtData,
  DecodedAddressPsbtData,
} from 'sats-connect';
import { getMempoolEndpoint } from '../../util';

export interface MempoolUtxo {
  txid: string;
  vout: number;
  value: number;
}

export const DUST_LIMIT = 546n;

const compactSizeLength = (value: number): number => {
  if (value < 0xfd) return 1;
  if (value <= 0xffff) return 3;
  if (value <= 0xffffffff) return 5;
  return 9;
};

const pushDataPrefixLength = (value: number): number => {
  if (value <= 75) return 1;
  if (value <= 0xff) return 2;
  if (value <= 0xffff) return 3;
  return 5;
};

type DecodedTapLeaf = Extract<
  DecodedAddressPsbtData['unlockDefinition'],
  { tapLeafScript: unknown }
>['tapLeafScript'][number];

const estimateTapLeafWitness = (tapLeafScript: DecodedTapLeaf): number => {
  const [controlBlock, scriptWithVersion] = tapLeafScript;
  const script = scriptWithVersion.subarray(0, -1);
  const decodedScript = OutScript.decode(script);
  const controlBlockLength = TaprootControlBlock.encode(controlBlock).length;

  let signatureCount: number;
  let stackSignatureSlots: number;
  if (decodedScript.type === 'tr_ms') {
    signatureCount = decodedScript.m;
    stackSignatureSlots = decodedScript.pubkeys.length;
  } else if (decodedScript.type === 'tr_ns') {
    signatureCount = decodedScript.pubkeys.length;
    stackSignatureSlots = signatureCount;
  } else if (decodedScript.type === 'pk') {
    signatureCount = 1;
    stackSignatureSlots = 1;
  } else {
    throw new Error(`Unsupported tapscript type: ${decodedScript.type}`);
  }

  return (
    compactSizeLength(stackSignatureSlots + 2) +
    signatureCount * 66 +
    (stackSignatureSlots - signatureCount) +
    compactSizeLength(script.length) +
    script.length +
    compactSizeLength(controlBlockLength) +
    controlBlockLength
  );
};

const estimateInputSizes = ({
  definitionType,
  decoded,
}: ResolvedAddressPsbtData): { stripped: number; witness: number } => {
  let scriptSigLength = 0;
  let witness: number;
  switch (definitionType) {
    case 'p2wpkh':
      witness = 1 + 74 + 34;
      break;
    case 'p2sh-p2wpkh': {
      if (!('redeemScript' in decoded.unlockDefinition)) {
        throw new Error('The decoded redeem script is missing.');
      }
      const { redeemScript } = decoded.unlockDefinition;
      scriptSigLength = pushDataPrefixLength(redeemScript.length) + redeemScript.length;
      witness = 1 + 74 + 34;
      break;
    }
    case 'p2tr-key-path':
      witness = 1 + 66;
      break;
    case 'p2wsh': {
      if (!('witnessScript' in decoded.unlockDefinition)) {
        throw new Error('The decoded witness script is missing.');
      }
      const { witnessScript } = decoded.unlockDefinition;
      const multisig = OutScript.decode(witnessScript);
      if (multisig.type !== 'ms') throw new Error('Only multisig P2WSH scripts are supported.');
      witness =
        compactSizeLength(multisig.m + 2) +
        1 +
        multisig.m * 74 +
        compactSizeLength(witnessScript.length) +
        witnessScript.length;
      break;
    }
    case 'p2tr-script-path': {
      if (!('tapLeafScript' in decoded.unlockDefinition)) {
        throw new Error('The decoded tap leaf script is missing.');
      }
      const leaves = decoded.unlockDefinition.tapLeafScript;
      witness = Math.max(...leaves.map(estimateTapLeafWitness));
      break;
    }
  }

  return {
    stripped: 32 + 4 + compactSizeLength(scriptSigLength) + scriptSigLength + 4,
    witness,
  };
};

/**
 * Older wallets answer `wallet_connect` without `scriptPubKey`/`unlockDefinition`. For a
 * single-sig address both are derivable from the address and its public key, so the example app
 * still builds PSBTs against those wallets. A vault (multisig) address is NOT derivable — its
 * witness script lives in the wallet — so those still require a wallet that supplies the fields.
 */
export interface ResolvedAddressPsbtData {
  decoded: DecodedAddressPsbtData;
  definitionType: NonNullable<Address['unlockDefinition']>['type'];
}

const deriveSingleSigPsbtData = (
  address: Address,
  network: BitcoinNetworkType,
): ResolvedAddressPsbtData | undefined => {
  if (!/^(?:[0-9a-f]{2})+$/i.test(address.publicKey)) return undefined;

  const bitcoinNetwork = network === BitcoinNetworkType.Mainnet ? NETWORK : TEST_NETWORK;
  let scriptPubKey: Uint8Array;
  try {
    scriptPubKey = OutScript.encode(BitcoinAddress(bitcoinNetwork).decode(address.address));
  } catch {
    return undefined;
  }
  const publicKey = hex.decode(address.publicKey);

  switch (address.addressType) {
    case AddressType.p2wpkh:
      return { decoded: { scriptPubKey, unlockDefinition: {} }, definitionType: 'p2wpkh' };
    case AddressType.p2sh:
      // Xverse's nested-segwit payment address; any other p2sh shape is not derivable here.
      try {
        return {
          decoded: {
            scriptPubKey,
            unlockDefinition: { redeemScript: p2wpkh(publicKey, bitcoinNetwork).script },
          },
          definitionType: 'p2sh-p2wpkh',
        };
      } catch {
        return undefined;
      }
    case AddressType.p2tr: {
      // Wallets return either the 33-byte compressed key or the 32-byte x-only key.
      if (publicKey.length !== 32 && publicKey.length !== 33) return undefined;
      const tapInternalKey = publicKey.length === 33 ? publicKey.subarray(1) : publicKey;
      return {
        decoded: { scriptPubKey, unlockDefinition: { tapInternalKey } },
        definitionType: 'p2tr-key-path',
      };
    }
    default:
      return undefined;
  }
};

/**
 * Wallet-supplied PSBT metadata wins; a single-sig address falls back to local derivation.
 * Returns undefined when neither is possible, which is the signal to leave the address out.
 */
export const resolveAddressPsbtData = (
  address: Address,
  network: BitcoinNetworkType,
): ResolvedAddressPsbtData | undefined => {
  if (address.scriptPubKey && address.unlockDefinition) {
    try {
      return {
        decoded: decodeAddressPsbtData(address),
        definitionType: address.unlockDefinition.type,
      };
    } catch {
      return undefined;
    }
  }
  return deriveSingleSigPsbtData(address, network);
};

export const estimateSignedWeight = (
  resolved: ResolvedAddressPsbtData,
  inputCount: number,
  outputScripts: Uint8Array[],
): number => {
  const input = estimateInputSizes(resolved);
  const strippedSize =
    4 +
    compactSizeLength(inputCount) +
    input.stripped * inputCount +
    compactSizeLength(outputScripts.length) +
    outputScripts.reduce(
      (size, script) => size + 8 + compactSizeLength(script.length) + script.length,
      0,
    ) +
    4;

  return strippedSize * 4 + 2 + input.witness * inputCount;
};

export const feeForWeight = (weight: number, feeRate: number): bigint =>
  BigInt(Math.ceil((weight * feeRate) / 4));

export const parseUtxos = (value: unknown): MempoolUtxo[] => {
  if (!Array.isArray(value)) throw new Error('The mempool UTXO response is malformed.');

  return value.map((utxo: unknown) => {
    if (!utxo || typeof utxo !== 'object') {
      throw new Error('The mempool UTXO response is malformed.');
    }
    const candidate = utxo as Record<string, unknown>;
    if (
      typeof candidate.txid !== 'string' ||
      !/^[0-9a-f]{64}$/i.test(candidate.txid) ||
      !Number.isInteger(candidate.vout) ||
      (candidate.vout as number) < 0 ||
      !Number.isSafeInteger(candidate.value) ||
      (candidate.value as number) <= 0
    ) {
      throw new Error('The mempool UTXO response is malformed.');
    }
    return {
      txid: candidate.txid,
      vout: candidate.vout as number,
      value: candidate.value as number,
    };
  });
};

export const fetchJson = async (url: string): Promise<unknown> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Request to ${url} failed with HTTP ${response.status}.`);
  return response.json();
};

/** Xverse's recommended regular rate, in sat/vB. The endpoint is network-agnostic. */
export const fetchFeeRate = async (): Promise<number> => {
  const response = await fetchJson('https://api-3.xverse.app/v1/fees/btc');
  if (!response || typeof response !== 'object' || !('regular' in response)) {
    throw new Error('The recommended fee response is malformed.');
  }
  const feeRate = Number(response.regular);
  if (!Number.isFinite(feeRate) || feeRate <= 0) {
    throw new Error('The recommended fee response is malformed.');
  }
  return feeRate;
};

export const fetchUtxos = async (
  address: string,
  network: BitcoinNetworkType,
): Promise<MempoolUtxo[]> => {
  const response = await fetchJson(`${getMempoolEndpoint(network)}api/address/${address}/utxo`);
  return parseUtxos(response).sort((left, right) => right.value - left.value);
};
