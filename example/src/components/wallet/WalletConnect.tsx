import { Button, Card, NativeSelect } from '@mantine/core';
import { useState } from 'react';
import { AddressPurpose, BitcoinNetworkType, request } from 'sats-connect';

export const WalletConnect = () => {
  const [desiredNetwork, setDesiredNetwork] = useState<BitcoinNetworkType>(
    BitcoinNetworkType.Mainnet,
  );
  const [response, setResponse] = useState<string | null>(null);

  const handleWalletConnect = () => {
    const handler = async () => {
      const method = 'wallet_connect';
      const options = {
        message: 'Cool app wants to know your addresses!',
        addresses: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
        network: desiredNetwork,
      };
      console.log(`called request("${method}") with options:`);
      console.log(options);
      const res = await request(method, options);
      setResponse(JSON.stringify(res, null, 2));

      if (res.status === 'error') {
        console.error('wallet_connect error');
        console.error(res);
        return;
      }
    };
    handler().catch(console.error);
  };
  return (
    <Card>
      <h3>wallet_connect</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <NativeSelect
            label={'network'}
            onChange={(e) => setDesiredNetwork(e.target.value as BitcoinNetworkType)}
          >
            <option value={BitcoinNetworkType.Mainnet}>{BitcoinNetworkType.Mainnet}</option>
            <option value={BitcoinNetworkType.Testnet}>{BitcoinNetworkType.Testnet}</option>
            <option value={BitcoinNetworkType.Testnet4}>{BitcoinNetworkType.Testnet4}</option>
            <option value={BitcoinNetworkType.Signet}>{BitcoinNetworkType.Signet}</option>
            <option value={BitcoinNetworkType.Regtest}>{BitcoinNetworkType.Regtest}</option>
          </NativeSelect>
          <Button onClick={handleWalletConnect}>request</Button>
        </div>
        <div>
          <h4>Response</h4>
          <pre
            style={{
              maxHeight: 800,
              fontSize: 'x-small',
              overflowY: 'auto',
            }}
          >
            {response ? response : 'No response yet'}
          </pre>
        </div>
      </div>
    </Card>
  );
};
export default WalletConnect;
