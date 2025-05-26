import { Button, Card, Input } from '@mantine/core';
import { hashMessage } from '@stacks/encryption';
import { publicKeyFromSignatureRsv } from '@stacks/transactions';
import { useState } from 'react';
import { Address, request } from 'sats-connect';

interface Props {
  addresses: Address[];
}

export const SignMessageStacks = ({ addresses }: Props) => {
  const [message, setMessage] = useState('Hello, world!');

  const onClick = async () => {
    const messageHash = hashMessage(message);
    const response = await request('stx_signMessage', {
      message,
    });
    if (response.status === 'success') {
      alert(`Message signed successfully. Check console for details.`);
      console.log('Response:', response.result);
      const sigPubKey = publicKeyFromSignatureRsv(
        Buffer.from(messageHash).toString('hex'),
        response.result.signature,
      );
      if (sigPubKey === addresses[0]?.publicKey) {
        console.log('Message verified successfully.');
      } else {
        console.log('Message verification failed.');
      }
    } else {
      console.error(response.error);
      alert('Error signing message. See console for details.');
    }
  };

  return (
    <Card>
      <h3>Sign Message</h3>
      <>
        <div>
          <div>Message</div>
          <Input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <Button onClick={() => void onClick()} disabled={!message} style={{ marginTop: 15 }}>
          Sign Message
        </Button>
      </>
    </Card>
  );
};
