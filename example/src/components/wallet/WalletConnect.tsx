import { ActionIcon, Button, Card, Code, NativeSelect } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { useState } from 'react';
import { AddressPurpose, BitcoinNetworkType, request, type ConnectParams } from 'sats-connect';
import styled from 'styled-components';

const MethodHeading = styled.h3({
  display: 'flex',
  alignItems: 'center',
  a: { marginLeft: '1rem' },
});

const TwoColGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
});

const FormDiv = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginTop: '1rem',
});

export const WalletConnect = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [options, setOptions] = useState<ConnectParams>({
    message: 'Optional message displayed on connection popup',
    addresses: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
    network: BitcoinNetworkType.Mainnet,
  });

  const handleWalletConnect = () => {
    const handler = async () => {
      const method = 'wallet_connect';
      const res = await request(method, options);
      setResponse(JSON.stringify(res, null, 2));
      console.log('request("wallet_connect", options)');
      console.log('options:\n', options);
      console.log('response:\n', res);

      if (res.status === 'error') {
        console.error('wallet_connect error');
        return;
      }
    };
    handler().catch(console.error);
  };

  return (
    <Card>
      <MethodHeading>
        wallet_connect
        <ActionIcon
          component="a"
          href="https://docs.xverse.app/sats-connect/connecting-to-the-wallet/connect-to-xverse-wallet"
          target="_blank"
          variant="transparent"
          size="sm"
        >
          <IconExternalLink />
        </ActionIcon>
      </MethodHeading>
      <TwoColGrid>
        <div>
          <h4>Options</h4>
          <Code block>{JSON.stringify(options, null, 2)}</Code>
          <FormDiv>
            <NativeSelect
              label={'network'}
              data={Object.values(BitcoinNetworkType)}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, network: e.target.value as BitcoinNetworkType }))
              }
            />
            <Button onClick={handleWalletConnect}>request</Button>
          </FormDiv>
        </div>
        <div>
          <h4>Response</h4>
          <Code block>{response}</Code>
        </div>
      </TwoColGrid>
    </Card>
  );
};
export default WalletConnect;
