import { base64, hex } from '@scure/base';
import * as btc from '@scure/btc-signer';
import axios from 'axios';
import { useState } from 'react';
import Wallet, { Address, AddressPurpose, BitcoinNetworkType } from 'sats-connect';
import { Button, Card, Input } from '../../App.styles';

interface Utxo {
  txid: string;
  vout: number;
  value: number;
}

const getAddressUtxos = async (address: string, network: BitcoinNetworkType) => {
  const url =
    network === BitcoinNetworkType.Mainnet
      ? 'https://btc-1.xverse.app'
      : network === BitcoinNetworkType.Testnet
      ? 'https://btc-testnet.xverse.app'
      : 'https://btc-signet.xverse.app';
  const response = await axios.get<Utxo[]>(`${url}/address/${address}/utxo`);
  return response.data;
};

interface Props {
  network: BitcoinNetworkType;
  addresses: Address[];
}

const SendAllAssets = ({ addresses, network }: Props) => {
  const [recipient, setRecipient] = useState('');
  const [addExternalInput, setAddExternalInput] = useState(false);

  const paymentsAddress = addresses.find((a) => a.purpose === AddressPurpose.Payment);

  const ordinalsAddress = addresses.find((a) => a.purpose === AddressPurpose.Ordinals);

  const onSign = async () => {
    if (!paymentsAddress || !ordinalsAddress) {
      alert('Missing addresses');
      return;
    }
    const paymentUtxos = await getAddressUtxos(paymentsAddress.address, network);
    const ordinalsUtxos = await getAddressUtxos(ordinalsAddress.address, network);

    const p2wpkh = btc.p2wpkh(
      hex.decode(paymentsAddress.publicKey),
      network === BitcoinNetworkType.Mainnet ? btc.NETWORK : btc.TEST_NETWORK
    );
    const p2sh = btc.p2sh(
      p2wpkh,
      network === BitcoinNetworkType.Mainnet ? btc.NETWORK : btc.TEST_NETWORK
    );

    const p2tr = btc.p2tr(
      hex.decode(ordinalsAddress.publicKey),
      undefined,
      network === BitcoinNetworkType.Mainnet ? btc.NETWORK : btc.TEST_NETWORK
    );

    const txn = new btc.Transaction();

    for (const utxo of ordinalsUtxos) {
      txn.addInput({
        txid: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: p2tr.script,
          amount: BigInt(utxo.value),
        },
        ...p2tr,
      });

      txn.addOutputAddress(
        recipient,
        BigInt(utxo.value),
        network === BitcoinNetworkType.Mainnet ? btc.NETWORK : btc.TEST_NETWORK
      );
    }

    let totalIn = 0;
    const paymentInputsToSign: number[] = [];
    for (const utxo of paymentUtxos) {
      paymentInputsToSign.push(txn.inputsLength);
      txn.addInput({
        txid: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: p2sh.script,
          amount: BigInt(utxo.value),
        },
        ...p2sh,
      });

      totalIn += utxo.value;
    }
    // we make the fee 100 so nodes will reject the transaction if it's accidentally broadcast
    txn.addOutputAddress(
      recipient,
      BigInt(totalIn - 100),
      network === BitcoinNetworkType.Mainnet ? btc.NETWORK : btc.TEST_NETWORK
    );

    if (addExternalInput) {
      const p2pkh = btc.p2pkh(
        hex.decode(paymentsAddress.publicKey),
        network === BitcoinNetworkType.Mainnet ? btc.NETWORK : btc.TEST_NETWORK
      );
      txn.addInput({
        txid: '0000000000000000000000000000000000000000000000000000000000000000',
        index: 0,
        witnessUtxo: {
          script: p2pkh.script,
          amount: BigInt(2000),
        },
        ...p2pkh,
      });
    }

    const psbtBase64 = base64.encode(txn.toPSBT());

    const response = await Wallet.request('signPsbt', {
      psbt: psbtBase64,
      signInputs: {
        [paymentsAddress.address]: paymentInputsToSign,
        // we'll only sign the first input from the ordinals address to prevent accidental broadcast
        [ordinalsAddress.address]: [0],
      },
    });

    console.log(response);
    alert('PSBT signed. See console for details.');
  };

  return (
    <Card>
      <h3>Send all assets from ordinals address</h3>
      <div>
        This is a test endpoint which builds a dummy transaction with all assets from the ordinals
        address to a target recipient. Note that the transaction is not actually broadcast.
      </div>
      <div>You can optionally add a dummy input UTXO from a specified address.</div>
      <div>
        <div>Recipient address</div>
        <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} />
      </div>
      <div>
        <div>Add external input</div>
        <Input
          type="checkbox"
          checked={addExternalInput}
          onChange={() => setAddExternalInput((curr) => !curr)}
        />
      </div>
      <Button
        onClick={() => {
          onSign().catch((e) => {
            alert('An error occurred');
            console.error(e);
          });
        }}
        disabled={!recipient}
      >
        Build and Sign
      </Button>
    </Card>
  );
};

export default SendAllAssets;
