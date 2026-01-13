import { Button, Card } from '@mantine/core';
import { Verifier } from 'bip322-js';
import { useState } from 'react';
import { Address, MessageSigningProtocols, request, RpcErrorCode } from 'sats-connect';
import { MessageItem } from './MessageItem';

interface Props {
  addresses: Address[];
}

interface Message {
  address: string;
  message: string;
  protocol: MessageSigningProtocols;
}

export const SignMultipleMessages = ({ addresses }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const onAddMessage = () => {
    setMessages([
      ...messages,
      {
        address: addresses[0].address,
        message: '',
        protocol: MessageSigningProtocols.ECDSA,
      },
    ]);
  };

  const onClick = () => {
    request('signMultipleMessages', messages)
      .then((response) => {
        if (response.status === 'success') {
          alert(`Messages signed successfully check console for details. `);
          console.log(response.result);

          for (const { address, message, signature } of response.result) {
            const verified = Verifier.verifySignature(address, message, signature);
            if (!verified) {
              alert('Signature verification failed');
              return;
            }
            console.log(`verified: ${verified}`);
          }
        } else if (response.error.code === Number(RpcErrorCode.USER_REJECTION)) {
          alert('User cancelled the request');
        } else {
          console.error(response.error);
          alert('Error sending BTC. See console for details.');
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Error sending BTC. See console for details.');
      });
  };

  return (
    <Card>
      <h3>Sign Multiple Messages</h3>
      <div>
        {messages.map((msg, index) => (
          <MessageItem
            key={index}
            addresses={addresses}
            address={msg.address}
            setAddress={(address) => {
              const newMessages = [...messages];
              newMessages[index] = { ...newMessages[index], address };
              setMessages(newMessages);
            }}
            message={msg.message}
            setMessage={(message) => {
              const newMessages = [...messages];
              newMessages[index] = { ...newMessages[index], message };
              setMessages(newMessages);
            }}
            protocol={msg.protocol}
            setProtocol={(protocol) => {
              const newMessages = [...messages];
              newMessages[index] = { ...newMessages[index], protocol };
              setMessages(newMessages);
            }}
            onDelete={() => {
              const newMessages = messages.filter((_, i) => i !== index);
              setMessages(newMessages);
            }}
          />
        ))}
        <div>
          <Button onClick={onAddMessage} style={{ marginTop: 15 }}>
            Add Message
          </Button>
        </div>
      </div>
      <Button
        onClick={onClick}
        disabled={messages.length === 0 || messages.some((m) => !m.address || !m.message)}
        style={{ marginTop: 15 }}
      >
        Sign Messages
      </Button>
    </Card>
  );
};
