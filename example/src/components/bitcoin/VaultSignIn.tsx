import { Button, Card, Code, NativeSelect, Textarea } from '@mantine/core';
import { useRef, useState } from 'react';
import { Address, MessageSigningProtocols, request } from 'sats-connect';
import { ErrorMessage } from '../common';

interface Props {
  addresses: Address[];
}

interface SignResult {
  address: string;
  protocol: string;
  signature: string;
}

const makeSignInMessage = (address: string) => {
  const origin = window.location.origin;
  return `${window.location.host} wants you to sign in with your Bitcoin account:\n${address}\n\nSign in to the sats-connect example.\n\nURI: ${origin}\nVersion: 1\nNonce: vault-demo\nIssued At: ${new Date().toISOString()}`;
};

export function VaultSignIn({ addresses }: Props) {
  const [address, setAddress] = useState(addresses[0]?.address ?? '');
  const [message, setMessage] = useState(() => makeSignInMessage(addresses[0]?.address ?? ''));
  const [response, setResponse] = useState<SignResult[] | null>(null);
  const [error, setError] = useState<string>();
  const inFlight = useRef(false);

  const sign = async (multiple: boolean) => {
    if (inFlight.current || !address || !message) return;
    inFlight.current = true;
    setError(undefined);
    try {
      const result = multiple
        ? await request('signMultipleMessages', [
            { address, message, protocol: MessageSigningProtocols.BIP322 },
            {
              address,
              message: `${message}\n\nStatement: Approve the second vault message.`,
              protocol: MessageSigningProtocols.BIP322,
            },
          ])
        : await request('signMessage', {
            address,
            message,
            protocol: MessageSigningProtocols.BIP322,
          });
      if (result.status === 'error') throw new Error(result.error.message);
      setResponse(Array.isArray(result.result) ? result.result : [result.result]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <Card>
      <h3>Vault Bitcoin sign-in</h3>
      <p>Signs with the connected vault using BIP-322.</p>
      <NativeSelect
        aria-label="Vault Bitcoin address"
        value={address}
        onChange={(event) => {
          setAddress(event.target.value);
          setMessage(makeSignInMessage(event.target.value));
        }}
      >
        {addresses.map((item) => (
          <option key={`${item.purpose}:${item.address}`} value={item.address}>
            {item.purpose}: {item.address}
          </option>
        ))}
      </NativeSelect>
      <Textarea
        aria-label="Sign-in message"
        autosize
        minRows={8}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        mt="md"
      />
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <Button onClick={() => void sign(false)} disabled={!address || !message}>
          signMessage
        </Button>
        <Button onClick={() => void sign(true)} disabled={!address || !message}>
          signMultipleMessages
        </Button>
      </div>
      <h4>Base64 signature response</h4>
      <Code block>{response ? JSON.stringify(response, null, 2) : null}</Code>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </Card>
  );
}
