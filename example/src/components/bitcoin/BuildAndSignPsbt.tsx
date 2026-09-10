import { Switch } from '@mantine/core';
import { base64 } from '@scure/base';
import {
  Address as BitcoinAddress,
  NETWORK,
  OutScript,
  TaprootControlBlock,
  TEST_NETWORK,
  Transaction,
} from '@scure/btc-signer';
import { useMemo, useRef, useState } from 'react';
import {
  Address,
  BitcoinNetworkType,
  decodeAddressPsbtData,
  DecodedAddressPsbtData,
  request,
} from 'sats-connect';
import { Button, Card, Code, Input, NativeSelect } from '../../App.styles';
import { getMempoolEndpoint } from '../../util';

interface Props {
  addresses: Address[];
  network: BitcoinNetworkType;
}

interface MempoolUtxo {
  txid: string;
  vout: number;
  value: number;
}

interface SignResult {
  psbt: string;
  txid?: string;
}

const DUST_LIMIT = 546n;

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

const estimateInputSizes = (
  address: Address,
  decoded: ReturnType<typeof decodeAddressPsbtData>,
): { stripped: number; witness: number } => {
  const definition = address.unlockDefinition;
  if (!definition) throw new Error('The selected address has no unlock definition.');

  let scriptSigLength = 0;
  let witness: number;
  switch (definition.type) {
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

const estimateSignedWeight = (
  address: Address,
  decoded: ReturnType<typeof decodeAddressPsbtData>,
  inputCount: number,
  outputScripts: Uint8Array[],
): number => {
  const input = estimateInputSizes(address, decoded);
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

const feeForWeight = (weight: number, feeRate: number): bigint =>
  BigInt(Math.ceil((weight * feeRate) / 4));

const parseUtxos = (value: unknown): MempoolUtxo[] => {
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

const fetchJson = async (url: string): Promise<unknown> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Mempool request failed with HTTP ${response.status}.`);
  return response.json();
};

export const BuildAndSignPsbt = ({ addresses, network }: Props) => {
  const usableAddresses = useMemo(
    () => addresses.filter((address) => address.scriptPubKey && address.unlockDefinition),
    [addresses],
  );
  const [selectedAddress, setSelectedAddress] = useState(usableAddresses[0]?.address ?? '');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [broadcast, setBroadcast] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [feeRate, setFeeRate] = useState<number>();
  const [result, setResult] = useState<SignResult>();
  const [error, setError] = useState('');
  const signingRef = useRef(false);

  const source =
    usableAddresses.find((address) => address.address === selectedAddress) ?? usableAddresses[0];

  const buildAndSign = async () => {
    if (signingRef.current) return;
    signingRef.current = true;
    setIsSigning(true);
    setError('');
    setResult(undefined);

    try {
      if (!source) throw new Error('No Bitcoin address with PSBT metadata is available.');
      if (!/^\d+$/.test(amount) || BigInt(amount) <= 0n) {
        throw new Error('Amount must be a positive whole number of satoshis.');
      }
      if (!recipient.trim()) throw new Error('Recipient address is required.');

      const bitcoinNetwork = network === BitcoinNetworkType.Mainnet ? NETWORK : TEST_NETWORK;
      const recipientScript = OutScript.encode(BitcoinAddress(bitcoinNetwork).decode(recipient));
      const decoded = decodeAddressPsbtData(source);
      const endpoint = getMempoolEndpoint(network);
      const [utxoResponse, feeResponse] = await Promise.all([
        fetchJson(`${endpoint}api/address/${source.address}/utxo`),
        fetchJson(`${endpoint}api/v1/fees/recommended`),
      ]);
      const utxos = parseUtxos(utxoResponse).sort((left, right) => right.value - left.value);
      if (!feeResponse || typeof feeResponse !== 'object' || !('halfHourFee' in feeResponse)) {
        throw new Error('The recommended fee response is malformed.');
      }
      const recommendedFeeRate = Number(feeResponse.halfHourFee);
      if (!Number.isFinite(recommendedFeeRate) || recommendedFeeRate <= 0) {
        throw new Error('The recommended fee response is malformed.');
      }
      setFeeRate(recommendedFeeRate);

      const amountSats = BigInt(amount);
      if (amountSats <= DUST_LIMIT) throw new Error('Amount must be above the dust limit.');
      const selected: MempoolUtxo[] = [];
      let selectedValue = 0n;
      let change = 0n;
      for (const utxo of utxos) {
        selected.push(utxo);
        selectedValue += BigInt(utxo.value);
        const noChangeFee = feeForWeight(
          estimateSignedWeight(source, decoded, selected.length, [recipientScript]),
          recommendedFeeRate,
        );
        if (selectedValue < amountSats + noChangeFee) continue;

        const withChangeFee = feeForWeight(
          estimateSignedWeight(source, decoded, selected.length, [
            recipientScript,
            decoded.scriptPubKey,
          ]),
          recommendedFeeRate,
        );
        const possibleChange = selectedValue - amountSats - withChangeFee;
        change = possibleChange > DUST_LIMIT ? possibleChange : 0n;
        break;
      }

      if (selectedValue < amountSats || selected.length === 0) {
        throw new Error('The selected address has insufficient funds.');
      }
      const finalFee = feeForWeight(
        estimateSignedWeight(
          source,
          decoded,
          selected.length,
          change > 0n ? [recipientScript, decoded.scriptPubKey] : [recipientScript],
        ),
        recommendedFeeRate,
      );
      if (selectedValue < amountSats + finalFee) {
        throw new Error('The selected address has insufficient funds for the recommended fee.');
      }

      const transaction = new Transaction({ PSBTVersion: 0 });
      selected.forEach((utxo) => {
        transaction.addInput({
          txid: utxo.txid,
          index: utxo.vout,
          witnessUtxo: { script: decoded.scriptPubKey, amount: BigInt(utxo.value) },
          ...decoded.unlockDefinition,
        });
      });
      transaction.addOutput({ script: recipientScript, amount: amountSats });
      if (change > 0n) {
        transaction.addOutput({ script: decoded.scriptPubKey, amount: change });
      }

      const response = await request('signPsbt', {
        psbt: base64.encode(transaction.toPSBT(0)),
        signInputs: { [source.address]: selected.map((_, index) => index) },
        broadcast,
      });
      if (response.status === 'error') throw new Error(response.error.message);
      setResult(response.result);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
    } finally {
      signingRef.current = false;
      setIsSigning(false);
    }
  };

  return (
    <Card>
      <h3>Build &amp; sign PSBT</h3>
      <p>
        Vault requests wait in the wallet popup for co-signers. With wallet broadcast off, this dApp
        displays the returned PSBT without broadcasting it.
      </p>
      <div>Source address</div>
      <NativeSelect
        value={source?.address ?? ''}
        onChange={(event) => setSelectedAddress(event.target.value)}
        disabled={!usableAddresses.length || isSigning}
      >
        {usableAddresses.map((address) => (
          <option key={address.address} value={address.address}>
            {address.purpose}: {address.address} ({address.unlockDefinition?.type})
          </option>
        ))}
      </NativeSelect>
      <div>Recipient address</div>
      <Input
        value={recipient}
        onChange={(event) => setRecipient(event.target.value)}
        disabled={isSigning}
      />
      <div>Amount (sats)</div>
      <Input
        type="number"
        min="1"
        step="1"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        disabled={isSigning}
      />
      <Switch
        checked={broadcast}
        onChange={(event) => setBroadcast(event.currentTarget.checked)}
        disabled={isSigning}
        label={`Wallet broadcast: ${broadcast ? 'on' : 'off'}`}
      />
      <Button
        onClick={() => void buildAndSign()}
        disabled={!source || isSigning}
        loading={isSigning}
      >
        Build &amp; sign PSBT
      </Button>
      {feeRate !== undefined && <div>Recommended fee rate: {feeRate} sat/vB</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {result && (
        <div>
          <h4>{result.txid ? 'Transaction ID' : 'Signed PSBT'}</h4>
          <Code style={{ overflowWrap: 'anywhere' }}>{result.txid ?? result.psbt}</Code>
          {result.txid && (
            <details>
              <summary>Returned PSBT</summary>
              <Code style={{ overflowWrap: 'anywhere' }}>{result.psbt}</Code>
            </details>
          )}
        </div>
      )}
    </Card>
  );
};
