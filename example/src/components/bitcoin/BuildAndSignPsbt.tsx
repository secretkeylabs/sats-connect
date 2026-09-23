import { Switch } from '@mantine/core';
import { base64 } from '@scure/base';
import {
  Address as BitcoinAddress,
  NETWORK,
  OutScript,
  TEST_NETWORK,
  Transaction,
} from '@scure/btc-signer';
import { useMemo, useRef, useState } from 'react';
import { Address, BitcoinNetworkType, request } from 'sats-connect';
import { Button, Card, Code, Input, NativeSelect } from '../../App.styles';
import {
  DUST_LIMIT,
  estimateSignedWeight,
  feeForWeight,
  fetchFeeRate,
  fetchUtxos,
  resolveAddressPsbtData,
  type MempoolUtxo,
} from './psbtBuilding';

interface Props {
  addresses: Address[];
  network: BitcoinNetworkType;
}

interface SignResult {
  psbt: string;
  txid?: string;
}

export const BuildAndSignPsbt = ({ addresses, network }: Props) => {
  // Wallet-supplied metadata when present, locally derived for single-sig on older wallets.
  const usableAddresses = useMemo(
    () =>
      addresses.flatMap((address) => {
        const resolved = resolveAddressPsbtData(address, network);
        return resolved ? [{ address, resolved }] : [];
      }),
    [addresses, network],
  );
  const [selectedAddress, setSelectedAddress] = useState(usableAddresses[0]?.address.address ?? '');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [broadcast, setBroadcast] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [feeRate, setFeeRate] = useState<number>();
  const [result, setResult] = useState<SignResult>();
  const [error, setError] = useState('');
  const signingRef = useRef(false);

  const source =
    usableAddresses.find((entry) => entry.address.address === selectedAddress) ??
    usableAddresses[0];

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
      const { decoded } = source.resolved;
      const [utxos, recommendedFeeRate] = await Promise.all([
        fetchUtxos(source.address.address, network),
        fetchFeeRate(network),
      ]);
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
          estimateSignedWeight(source.resolved, selected.length, [recipientScript]),
          recommendedFeeRate,
        );
        if (selectedValue < amountSats + noChangeFee) continue;

        const withChangeFee = feeForWeight(
          estimateSignedWeight(source.resolved, selected.length, [
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
          source.resolved,
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
        signInputs: { [source.address.address]: selected.map((_, index) => index) },
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
        value={source?.address.address ?? ''}
        onChange={(event) => setSelectedAddress(event.target.value)}
        disabled={!usableAddresses.length || isSigning}
      >
        {usableAddresses.map(({ address, resolved }) => (
          <option key={address.address} value={address.address}>
            {address.purpose}: {address.address} ({resolved.definitionType})
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
