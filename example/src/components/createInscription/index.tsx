import { useCallback, useMemo, useState } from 'react';
import Wallet, { BitcoinNetworkType, createInscription } from 'sats-connect';
import { Button, Card, Input, Success } from '../../App.styles';
import { getMempoolEndpoint } from '../../util';

interface Props {
  network: BitcoinNetworkType;
}

export const CreateInscription = ({ network }: Props) => {
  const [content, setContent] = useState<string>('');

  const onClick = useCallback(() => {
    (async () => {
      alert(content);
      await createInscription({
        payload: {
          network: {
            type: network,
          },
          contentType: 'text/plain',
          content: content,
          payloadType: 'PLAIN_TEXT',
        },
        onFinish: (response) => {
          alert(response.txId);
        },
        onCancel: () => alert('Canceled'),
      });
    })().catch(console.error);
  }, [content]);

  return (
    <Card>
      <h3>Create Inscriptions</h3>
      <h4>Sample BRC20 deploy payload</h4>
      <pre>{'{ "p": "brc-20","op": "deploy","tick": "rrfq","max": "21000000","lim": "1000"}'}</pre>

      <h4>Sample BRC20 mint payload</h4>
      <pre>{'{ "p": "brc-20","op": "mint","tick": "rrfq","amt": "1000" }'}</pre>

      <h2>Inscription text/plain payload</h2>
      <Input
        type="text"
        placeholder="Payload"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <Button onClick={onClick}>Send</Button>
    </Card>
  );
};
