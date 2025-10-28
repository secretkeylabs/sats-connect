import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { base64, hex } from '@scure/base';
import { useCallback, useState } from 'react';
import { request } from 'sats-connect';
import { Button, Card, Failure, Input, Success } from '../../../App.styles';

interface Props {
  sparkPublicKey: string;
}

export const SparkSignMessage = ({ sparkPublicKey }: Props) => {
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [signatureIsValid, setSignatureIsValid] = useState(true);

  const onClick = useCallback(() => {
    (async () => {
      const response = await request('spark_signMessage', {
        message,
      });

      if (response.status === 'error') {
        console.error(response.error);
        alert('Error signing Spark message. See console for details.');
        return;
      }

      setSignature(response.result.signature);

      // Verify signature
      const decodedMessage = new TextEncoder().encode(message);
      const hashedMsg = sha256(decodedMessage);

      const decodedSignature = base64.decode(response.result.signature);
      const decodedPublicKey = hex.decode(sparkPublicKey);

      const isValid = secp256k1.verify(decodedSignature, hashedMsg, decodedPublicKey, {
        prehash: false,
      });

      setSignatureIsValid(isValid);
    })().catch(console.error);
  }, [message, sparkPublicKey]);

  return (
    <Card>
      <h3>Sign message</h3>
      {!signature && (
        <>
          <div>
            <div>Message</div>
            <Input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button onClick={onClick} disabled={!message}>
            Sign
          </Button>
        </>
      )}
      {signature &&
        (signatureIsValid ? (
          <Success>
            Success!
            <div>Signature (base64 encoded):</div>
            <div>{signature}</div>
            <div>Message:</div>
            <div>{message}</div>
          </Success>
        ) : (
          <Failure>
            Invalid Signature Returned!
            <div>Signature (base64 encoded):</div>
            <div>{signature}</div>
            <div>Message:</div>
            <div>{message}</div>
          </Failure>
        ))}
    </Card>
  );
};
