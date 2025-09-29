import { useCallback, useState } from 'react';
import { request } from 'sats-connect';
import { Button, Card, Input, Success } from '../../../App.styles';

export const SparkSignStructuredMessage = () => {
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');

  const onClick = useCallback(() => {
    (async () => {
      const response = await request('spark_flashnet_signStructuredMessage', {
        message,
      });

      if (response.status === 'error') {
        console.error(response.error);
        alert('Error signing Flashnet message. See console for details.');
        return;
      }

      setSignature(response.result.signature);
    })().catch(console.error);
  }, [message]);

  return (
    <Card>
      <h3>Sign structured message</h3>
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
      {signature && (
        <Success>
          Success!
          <div>Signature:</div>
          <div>{signature}</div>
          <div>Message:</div>
          <div>{message}</div>
        </Success>
      )}
    </Card>
  );
};
