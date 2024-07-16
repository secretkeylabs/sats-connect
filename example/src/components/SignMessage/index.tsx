import { useState } from 'react';
import Wallet, { Address, MessageSigningProtocols, RpcErrorCode } from 'sats-connect';
import { Verifier } from 'bip322-js';
import { verify } from 'bitcoinjs-message';
import { Card, Button } from '../../App.styles';

interface Props {
  addresses: Address[];
}

export const SignMessage = ({ addresses }: Props) => {
  const [message, setMessage] = useState('');
  const [address, setAddress] = useState(addresses[0].address);
  const [protocol, setProtocol] = useState(MessageSigningProtocols.ECDSA);

  const onClick = async () => {
    const response = await Wallet.request('signMessage', {
      message,
      address,
      protocol: protocol ? (protocol as MessageSigningProtocols) : MessageSigningProtocols.ECDSA,
    });
    if (response.status === 'success') {
      alert(`Message signed successfully check console for details. `);
      console.log(response.result);
      if (protocol === MessageSigningProtocols.ECDSA) {
        const verified = verify(message, address, response.result.signature, undefined, true);
        if (!verified) {
          alert('Signature verification failed');
          return;
        }
        console.log(`verified: ${verified}`);
      }
      if (protocol === MessageSigningProtocols.BIP322) {
        const verified = Verifier.verifySignature(address, message, response.result.signature);
        if (!verified) {
          alert('Signature verification failed');
          return;
        }
        console.log(`verified: ${verified}`);
      }
    } else if (response.error.code === RpcErrorCode.USER_REJECTION) {
      alert('User cancelled the request');
    } else {
      console.error(response.error);
      alert('Error sending BTC. See console for details.');
    }
  };

  return (
    <Card>
      <h3>Sign Message</h3>
      <>
        <div>
          <div>Message</div>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <div style={{ marginTop: 15 }}>
          <div>Address</div>
          <select defaultValue={address} onChange={(e) => setAddress(e.target.value)}>
            <option value={addresses[0].address}>{addresses[0].address}</option>
            <option value={addresses[1].address}>{addresses[1].address}</option>
          </select>
        </div>
        <div style={{ marginTop: 15 }}>
          <div>Protocol</div>
          <select
            defaultValue={protocol}
            onChange={(e) => setProtocol(e.target.value as MessageSigningProtocols)}
          >
            <option value={MessageSigningProtocols.ECDSA}>{MessageSigningProtocols.ECDSA}</option>
            <option value={MessageSigningProtocols.BIP322}>{MessageSigningProtocols.BIP322}</option>
          </select>
        </div>
        <Button onClick={onClick} disabled={!message} style={{ marginTop: 15 }}>
          Sign Message
        </Button>
      </>
    </Card>
  );
};
