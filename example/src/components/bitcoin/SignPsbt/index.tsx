import { Button, Card, Input } from '@mantine/core';
import { base64 } from '@scure/base';
import * as btc from '@scure/btc-signer';
import { useEffect, useState } from 'react';
import Wallet, { Address, RpcErrorCode } from 'sats-connect';

interface Props {
  addresses: Address[];
}

export const SignPsbt = ({ addresses }: Props) => {
  const [psbt, setPsbt] = useState('');
  const [signInputs, setSignInputs] = useState<number[]>([]);

  const payAddress = addresses.find((address) => address.purpose === 'payment');
  const ordAddress = addresses.find((address) => address.purpose === 'ordinals');

  useEffect(() => {
    if (!ordAddress) {
      return;
    }

    const generatePsbt = async () => {
      const resp = await fetch(
        `https://api-3.xverse.app/v2/address/${ordAddress.address}/ordinal-utxo?limit=60`,
      );
      const { results: utxos } = await resp.json();

      let rune: string | undefined;
      let runeAmount: bigint | undefined;
      let utxosToSend: { txid: string; vout: number; amount: number }[] = [];

      for (const utxo of utxos) {
        if (!rune && (utxo.runes?.length ?? 0) > 0) {
          const [firstRune] = utxo.runes;
          rune = firstRune[0];
          runeAmount = BigInt(firstRune[1].amount);
          utxosToSend.push({
            txid: utxo.txid,
            vout: utxo.vout,
            amount: utxo.value,
          });
        } else {
          for (const [runeName, amount] of utxo.runes || []) {
            if (rune === runeName) {
              runeAmount = (runeAmount ?? 0n) + BigInt(amount.amount);
              utxosToSend.push({
                txid: utxo.txid,
                vout: utxo.vout,
                amount: utxo.value,
              });
              break;
            }
          }
        }
      }

      if (utxosToSend.length === 0) {
        alert('No runes found on ordinals address');
        return;
      }

      const runeResp = await fetch(`https://api-3.xverse.app/v1/runes/${rune}`);
      const runeInfo = await runeResp.json();

      const scriptResp = await fetch(`https://api-3.xverse.app/v1/runes/tools/encode-edicts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: {
            edicts: [
              {
                id: runeInfo.id,
                amount: Number(((runeAmount ?? 1n) * 2n).toString()),
                output: 1,
              },
            ],
          },
        }),
      });
      const script = await scriptResp.json();

      const p2tr = btc.p2tr(ordAddress.publicKey);

      const txn = new btc.Transaction({ allowUnknownInputs: true, allowUnknownOutputs: true });
      let vinTotal = 0;

      for (const utxo of utxosToSend) {
        txn.addInput({
          txid: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            amount: BigInt(utxo.amount),
            script: p2tr.script,
          },
        });
        vinTotal += utxo.amount;
      }

      txn.addOutput({
        script: script.payload,
        amount: 0n,
      });
      txn.addOutputAddress(payAddress!.address, BigInt(vinTotal - txn.inputsLength * 100));

      const psbt = txn.toPSBT();
      setPsbt(base64.encode(psbt));
      setSignInputs([...Array(txn.inputsLength).keys()]);
    };

    generatePsbt();
  }, []);

  const onClick = async () => {
    const response = await Wallet.request('signPsbt', {
      psbt,
      signInputs: {
        [ordAddress?.address ?? '']: signInputs,
      },
    });
    if (response.status === 'success') {
      alert(`PSBT signed successfully check console for details. `);
      console.log(response.result);
    } else if (response.error.code === RpcErrorCode.USER_REJECTION) {
      alert('User cancelled the request');
    } else {
      console.error(response.error);
      alert('Error signing PSBT. See console for details.');
    }
  };

  return (
    <Card>
      <h3>Sign PSBT</h3>
      <>
        <div>
          <div>PSBT</div>
          <Input type="text" value={psbt} onChange={(e) => setPsbt(e.target.value)} />
        </div>
        <Button onClick={onClick} disabled={!psbt} style={{ marginTop: 15 }}>
          Sign PSBT
        </Button>
      </>
    </Card>
  );
};
