import { Stack, TextInput } from '@mantine/core';
import { hashMessage } from '@stacks/encryption';
import { publicKeyFromSignatureRsv } from '@stacks/transactions';
import { useState } from 'react';
import { Address, request, StxSignMessageParams } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

interface Props {
  addresses: Address[];
}

export const SignMessageStacks = ({ addresses }: Props) => {
  const [response, setResponse] = useState<string | null>(null);
  const [options, setOptions] = useState<StxSignMessageParams>({
    message: 'Hello, world!',
  });

  const handleSignMessage = () => {
    const message = options.message;
    const handler = async () => {
      const params: StxSignMessageParams = { message };
      setOptions(params);

      const messageHash = hashMessage(message);
      const res = await request('stx_signMessage', params);
      setResponse(JSON.stringify(res, null, 2));

      if (res.status === 'success') {
        const sigPubKey = publicKeyFromSignatureRsv(
          Buffer.from(messageHash).toString('hex'),
          res.result.signature,
        );
        if (sigPubKey === addresses[0]?.publicKey) {
          console.log('Message verified successfully.');
        } else {
          console.log('Message verification failed.');
        }
      } else {
        console.error(res.error);
      }
    };
    handler().catch(console.error);
  };

  return (
    <MethodLayout<StxSignMessageParams>
      method="stx_signMessage"
      docsUrl="https://docs.xverse.app/sats-connect/stacks-methods/stx_signmessage"
      options={options}
      handleRequest={handleSignMessage}
      response={response}
    >
      <Stack>
        <TextInput
          label="Message"
          value={options.message}
          onChange={(e) => setOptions({ message: e.target.value })}
        />
      </Stack>
    </MethodLayout>
  );
};
