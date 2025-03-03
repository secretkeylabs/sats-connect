import { Button, Card, NativeSelect } from '@mantine/core';
import { useState } from 'react';
import Wallet, { BitcoinNetworkType } from 'sats-connect';

const ChangeNetwork = () => {
  const [desiredNetwork, setDesiredNetwork] = useState<BitcoinNetworkType>(
    BitcoinNetworkType.Testnet4,
  );
  const handleChangeNetwork = async () => {
    const response = await Wallet.request('wallet_changeNetwork', {
      name: desiredNetwork,
    });

    if (response.status === 'error') {
      alert('Error changing network check logs for more info');
      console.error(response);
      return;
    }

    alert('Wallet Network changed');
  };
  return (
    <Card>
      <h3>Change Network</h3>
      <div style={{ marginBottom: 15 }}>
        <div>Network</div>
        <NativeSelect
          defaultValue={desiredNetwork}
          onChange={(e) => setDesiredNetwork(e.target.value as BitcoinNetworkType)}
        >
          <option value={BitcoinNetworkType.Mainnet}>{BitcoinNetworkType.Mainnet}</option>
          <option value={BitcoinNetworkType.Testnet}>{BitcoinNetworkType.Testnet}</option>
          <option value={BitcoinNetworkType.Testnet4}>{BitcoinNetworkType.Testnet4}</option>
          <option value={BitcoinNetworkType.Signet}>{BitcoinNetworkType.Signet}</option>
          <option value={BitcoinNetworkType.Regtest}>{BitcoinNetworkType.Regtest}</option>
        </NativeSelect>
      </div>
      <Button
        onClick={() => {
          handleChangeNetwork().catch(console.error);
        }}
      >
        Change Network
      </Button>
    </Card>
  );
};
export default ChangeNetwork;
