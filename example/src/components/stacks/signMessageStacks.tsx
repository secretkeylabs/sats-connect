import { Button, Card, Input } from '@mantine/core';
import { useState } from 'react';
import Wallet, { Address } from 'sats-connect';

interface Props {
  addresses: Address[];
}

export const SignMessageStacks = ({ addresses }: Props) => {
  const [message, setMessage] = useState('');

  const onClick = async () => {
    const response = await Wallet.request('stx_signMessage', {
      message,
      publicKey: addresses[0]?.publicKey,
    });
    if (response.status === 'success') {
      alert(`Message signed successfully. Check console for details.`);
      console.log(response.result);
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
