import { base64, hex } from '@scure/base';
import * as btc from '@scure/btc-signer';
import { useState } from 'react';
import Wallet, { Address, AddressPurpose, BitcoinNetworkType } from 'sats-connect';
import { Button, Card, Input, Success } from '../../App.styles';

interface Props {
  network: BitcoinNetworkType;
  addresses: Address[];
}

const SignPsbt = ({ addresses }: Props) => {
  const [psbt, setPsbt] = useState('');
  const [signed, setSigned] = useState('');

  const paymentsAddress =
    addresses.find((a) => a.purpose === AddressPurpose.Payment)?.address ?? '';

  const onClick = async () => {
    const response = await Wallet.request('signPsbt', {
      psbt,
      signInputs: {
        [paymentsAddress]: [0],
      },
    });

    if (response.status === 'error') {
      console.error(response.error);
      alert('Error sending BTC. See console for details.');
      return;
    }

    const txn = btc.Transaction.fromPSBT(base64.decode(response.result.psbt));
    txn.finalizeIdx(0);

    // setSigned(base64.encode(txn.toPSBT()));
    setSigned(response.result.psbt);
  };

  const signedHex = signed ? hex.encode(base64.decode(signed)) : '';

  return (
    <Card>
      <h3>Sign PSBT</h3>
      {!signed && (
        <>
          <div>
            <div>PSBT</div>
            <Input value={psbt} onChange={(e) => setPsbt(e.target.value)} />
          </div>
          <Button
            onClick={() => {
              onClick().catch((e) => {
                alert('An error occurred');
                console.error(e);
              });
            }}
            disabled={!psbt}
          >
            Sign
          </Button>
        </>
      )}
      {signed && (
        <Success style={{ cursor: 'pointer' }}>
          Success! Your signed PSBT in base64:
          <p
            style={{ wordWrap: 'break-word' }}
            onClick={() => {
              navigator.clipboard.writeText(signed).catch((err) => {
                console.error('Could not copy text: ', err);
              });
            }}
          >
            {signed}
          </p>
          Success! Your signed PSBT in hex:
          <p
            style={{ wordWrap: 'break-word' }}
            onClick={() => {
              navigator.clipboard.writeText(signedHex).catch((err) => {
                console.error('Could not copy text: ', err);
              });
            }}
          >
            {signedHex}
          </p>
        </Success>
      )}
    </Card>
  );
};

export default SignPsbt;
