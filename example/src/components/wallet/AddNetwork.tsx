import { Input, NativeSelect } from '@mantine/core';
import { useState } from 'react';
import { BitcoinNetworkType, request, type AddNetworkParams } from 'sats-connect';
import { MethodLayout } from '../../layouts/MethodLayout';

export const AddNetwork = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [options, setOptions] = useState<Extract<AddNetworkParams, { chain: 'bitcoin' }>>({
    chain: 'bitcoin',
    name: 'My Custom Regtest',
    type: BitcoinNetworkType.Regtest,
    indexerUrl: 'https://api-3.xverse.app',
    rpcUrl: 'http://localhost:18444',
  });

  const handleRequest = () => {
    const handler = async () => {
      const method = 'wallet_addNetwork';
      const res = await request(method, options);
      setResponse(JSON.stringify(res, null, 2));
      console.log(`request("${method}", options)`);
      console.log('options:\n', options);
      console.log('response:\n', res);

      if (res.status === 'error') {
        console.error('wallet_addNetwork error');
        console.error(res);
        return;
      }
    };
    handler().catch(console.error);
  };

  return (
    <MethodLayout<AddNetworkParams>
      method="wallet_addNetwork"
      docsUrl="https://docs.xverse.app#TODO"
      options={options}
      handleRequest={handleRequest}
      response={response}
    >
      <div>Chain</div>
      <NativeSelect
        defaultValue="bitcoin"
        data={['bitcoin']}
        onChange={(e) =>
          setOptions((prev) => ({ ...prev, network: e.target.value as BitcoinNetworkType }))
        }
        disabled
      />
      <div>Network type</div>
      <NativeSelect
        defaultValue="Regtest"
        data={Object.values(BitcoinNetworkType)}
        onChange={(e) =>
          setOptions((prev) => ({
            ...prev,
            type: e.target.value as BitcoinNetworkType,
          }))
        }
        disabled
      />
      <div>Name</div>
      <Input
        type="text"
        value={options.name}
        onChange={(e) => setOptions((prev) => ({ ...prev, name: e.target.value }))}
      />
      <div>RPC URL</div>
      <Input
        type="text"
        value={options.rpcUrl}
        onChange={(e) => setOptions((prev) => ({ ...prev, rpcUrl: e.target.value }))}
      />
      <div>RPC URL - fallback</div>
      <Input
        type="text"
        value={options.rpcFallbackUrl}
        onChange={(e) => setOptions((prev) => ({ ...prev, rpcFallbackUrl: e.target.value }))}
      />
      <div>Indexer URL</div>
      <Input
        type="text"
        value={options.indexerUrl}
        onChange={(e) => setOptions((prev) => ({ ...prev, indexerUrl: e.target.value }))}
      />
      <div>Block explorer URL</div>
      <Input
        type="text"
        value={options.blockExplorerUrl}
        onChange={(e) => setOptions((prev) => ({ ...prev, blockExplorerUrl: e.target.value }))}
      />
    </MethodLayout>
  );
};
