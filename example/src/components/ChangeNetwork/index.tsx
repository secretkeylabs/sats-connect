import { NativeSelect } from '@mantine/core';
import { useState } from 'react';
import { BitcoinNetworkType, request, type WalletChangeNetworkParams } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

const ChangeNetwork = () => {
  const [desiredNetwork, setDesiredNetwork] = useState<BitcoinNetworkType>(
    BitcoinNetworkType.Mainnet,
  );
  const [response, setResponse] = useState<string | null>(null);

  const handleChangeNetwork = async () => {
    const response = await request('wallet_changeNetwork', {
      name: desiredNetwork,
    });
    setResponse(JSON.stringify(response, null, 2));

    if (response.status === 'error') {
      console.error('wallet_changeNetwork error');
      return;
    }
  };
  return (
    <MethodLayout<WalletChangeNetworkParams>
      method="wallet_changeNetwork"
      docsUrl="https://docs.xverse.app/sats-connect/wallet-methods/wallet_changenetwork"
      options={{ name: desiredNetwork }}
      handleRequest={() => {
        handleChangeNetwork().catch(console.error);
      }}
      response={response}
    >
      <NativeSelect
        defaultValue={desiredNetwork}
        onChange={(e) => setDesiredNetwork(e.target.value as BitcoinNetworkType)}
        data={Object.values(BitcoinNetworkType)}
      />
    </MethodLayout>
  );
};
export default ChangeNetwork;
