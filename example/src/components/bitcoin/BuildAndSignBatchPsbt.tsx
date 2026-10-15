import { Checkbox, Stack } from '@mantine/core';
import { base64 } from '@scure/base';
import { Transaction } from '@scure/btc-signer';
import { useMemo, useRef, useState } from 'react';
import {
  Address,
  BitcoinNetworkType,
  signMultipleTransactions,
  type SignMultiplePsbtPayload,
  type SignTransactionResponse,
} from 'sats-connect';
import { Button, Card, Code, Input } from '../../App.styles';
import {
  DUST_LIMIT,
  estimateSignedWeight,
  feeForWeight,
  fetchFeeRate,
  fetchUtxos,
  resolveAddressPsbtData,
  type MempoolUtxo,
  type ResolvedAddressPsbtData,
} from './psbtBuilding';

interface Props {
  addresses: Address[];
  network: BitcoinNetworkType;
}

interface BuiltPsbt {
  address: string;
  purpose: string;
  utxo: MempoolUtxo;
  sendAmount: bigint;
  fee: bigint;
  payload: SignMultiplePsbtPayload;
}

const MAX_PSBTS = 50;

/**
 * One self-send per UTXO: each PSBT spends a single distinct UTXO back to the address
 * that owns it, so the batch carries no conflicting inputs and nothing leaves the wallet
 * but the fee.
 */
const buildSelfSends = (
  address: Address,
  resolved: ResolvedAddressPsbtData,
  utxos: MempoolUtxo[],
  feeRate: number,
  limit: number,
): BuiltPsbt[] => {
  const { decoded } = resolved;
  const built: BuiltPsbt[] = [];

  for (const utxo of utxos) {
    if (built.length >= limit) break;

    const fee = feeForWeight(estimateSignedWeight(resolved, 1, [decoded.scriptPubKey]), feeRate);
    const sendAmount = BigInt(utxo.value) - fee;
    // A UTXO that cannot pay its own fee and still leave a non-dust output is skipped
    // rather than failing the batch, so one dusty UTXO does not block the others.
    if (sendAmount <= DUST_LIMIT) continue;

    const transaction = new Transaction({ PSBTVersion: 0 });
    transaction.addInput({
      txid: utxo.txid,
      index: utxo.vout,
      witnessUtxo: { script: decoded.scriptPubKey, amount: BigInt(utxo.value) },
      ...decoded.unlockDefinition,
    });
    transaction.addOutput({ script: decoded.scriptPubKey, amount: sendAmount });

    built.push({
      address: address.address,
      purpose: address.purpose,
      utxo,
      sendAmount,
      fee,
      payload: {
        psbtBase64: base64.encode(transaction.toPSBT(0)),
        inputsToSign: [{ address: address.address, signingIndexes: [0] }],
      },
    });
  }

  return built;
};

export const BuildAndSignBatchPsbt = ({ addresses, network }: Props) => {
  // Wallet-supplied metadata when present, locally derived for single-sig on older wallets.
  const usableAddresses = useMemo(
    () =>
      addresses.flatMap((address) => {
        const resolved = resolveAddressPsbtData(address, network);
        return resolved ? [{ address, resolved }] : [];
      }),
    [addresses, network],
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [perAddress, setPerAddress] = useState('2');
  const [isSigning, setIsSigning] = useState(false);
  const [feeRate, setFeeRate] = useState<number>();
  const [built, setBuilt] = useState<BuiltPsbt[]>([]);
  const [results, setResults] = useState<SignTransactionResponse[]>();
  const [error, setError] = useState('');
  const signingRef = useRef(false);

  const chosen = usableAddresses.filter((entry) => selected.includes(entry.address.address));

  const toggle = (address: string) =>
    setSelected((current) =>
      current.includes(address)
        ? current.filter((entry) => entry !== address)
        : [...current, address],
    );

  const buildAndSign = async () => {
    if (signingRef.current) return;
    signingRef.current = true;
    setIsSigning(true);
    setError('');
    setResults(undefined);
    setBuilt([]);

    try {
      if (!chosen.length) throw new Error('Select at least one address.');
      const limit = Number(perAddress);
      if (!Number.isInteger(limit) || limit < 1) {
        throw new Error('PSBTs per address must be a positive whole number.');
      }

      const recommendedFeeRate = await fetchFeeRate();
      setFeeRate(recommendedFeeRate);

      const utxosPerAddress = await Promise.all(
        chosen.map((entry) => fetchUtxos(entry.address.address, network)),
      );
      const psbts = chosen.flatMap((entry, index) =>
        buildSelfSends(
          entry.address,
          entry.resolved,
          utxosPerAddress[index],
          recommendedFeeRate,
          limit,
        ),
      );

      if (!psbts.length) {
        throw new Error(
          'No spendable UTXO found. Each PSBT spends one UTXO back to its own address, so every UTXO must cover its own fee and leave a non-dust output.',
        );
      }
      if (psbts.length > MAX_PSBTS) {
        throw new Error(`The wallet accepts at most ${MAX_PSBTS} PSBTs in one batch.`);
      }
      setBuilt(psbts);

      await signMultipleTransactions({
        payload: {
          network: { type: network },
          message: `Self-send ${psbts.length} UTXO${psbts.length === 1 ? '' : 's'}`,
          psbts: psbts.map((entry) => entry.payload),
        },
        onFinish: (response) => setResults(response),
        onCancel: () => setError('The wallet cancelled the batch.'),
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
    } finally {
      signingRef.current = false;
      setIsSigning(false);
    }
  };

  return (
    <Card>
      <h3>Build &amp; sign batch PSBT</h3>
      <p>
        Builds one PSBT per UTXO, each spending that UTXO back to the address that owns it, and
        sends them as a single batch. The batch API has no broadcast option, so the wallet returns
        signed PSBTs and broadcasts nothing. For a vault the batch becomes one sign-only request
        that waits for co-signers.
      </p>
      <div>Source addresses</div>
      <Stack gap="xs">
        {usableAddresses.map(({ address, resolved }) => (
          <Checkbox
            key={address.address}
            checked={selected.includes(address.address)}
            onChange={() => toggle(address.address)}
            disabled={isSigning}
            label={`${address.purpose}: ${address.address} (${resolved.definitionType})`}
          />
        ))}
      </Stack>
      <div>Max PSBTs per address</div>
      <Input
        type="number"
        min="1"
        step="1"
        value={perAddress}
        onChange={(event) => setPerAddress(event.target.value)}
        disabled={isSigning}
      />
      <Button
        onClick={() => void buildAndSign()}
        disabled={!chosen.length || isSigning}
        loading={isSigning}
      >
        Build &amp; sign batch PSBT
      </Button>
      {feeRate !== undefined && <div>Recommended fee rate: {feeRate} sat/vB</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {built.length > 0 && (
        <div>
          <h4>Batch ({built.length})</h4>
          {built.map((entry) => (
            <div key={`${entry.utxo.txid}:${entry.utxo.vout}`}>
              {entry.purpose}: {entry.utxo.value} sats &rarr; {String(entry.sendAmount)} sats (fee{' '}
              {String(entry.fee)})
            </div>
          ))}
        </div>
      )}
      {results && (
        <div>
          <h4>Signed PSBTs ({results.length})</h4>
          {results.map((result, index) => (
            // The wallet returns results in request order and a PSBT may legitimately repeat,
            // so the index is the only stable key here.
            // eslint-disable-next-line react/no-array-index-key
            <details key={index}>
              <summary>
                PSBT {index + 1}
                {result.txId ? ` — ${result.txId}` : ''}
              </summary>
              <Code style={{ overflowWrap: 'anywhere' }}>{result.psbtBase64}</Code>
            </details>
          ))}
        </div>
      )}
    </Card>
  );
};
