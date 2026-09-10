import { useState } from 'react';
import { MethodLayout } from '../../layouts/MethodLayout';

interface TypedData {
  types: Record<string, { name: string; type: string }[]>;
  primaryType: string;
  domain: Record<string, string>;
  message: Record<string, string>;
}

interface XverseStarknetProvider {
  selectedAddress?: string;
  request(call: { type: string; params?: unknown }): Promise<unknown>;
  provider?: {
    verifyMessageInStarknet(
      typedData: TypedData,
      signature: string[],
      address: string,
      entrypoint: string,
    ): Promise<boolean>;
  };
}

const getProvider = () =>
  (window as unknown as { starknet_xverse?: XverseStarknetProvider }).starknet_xverse;

const makeTypedData = (chainId: string): TypedData => ({
  types: {
    StarknetDomain: [
      { name: 'name', type: 'shortstring' },
      { name: 'version', type: 'shortstring' },
      { name: 'chainId', type: 'shortstring' },
      { name: 'revision', type: 'shortstring' },
    ],
    VaultApproval: [
      { name: 'action', type: 'shortstring' },
      { name: 'request_id', type: 'felt' },
    ],
  },
  primaryType: 'VaultApproval',
  domain: { name: 'Sats Connect Example', version: '1', chainId, revision: '1' },
  message: { action: 'approve', request_id: '7' },
});

export function SignTypedData() {
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const options = makeTypedData('SN_MAIN');

  const handleRequest = async () => {
    setError(undefined);
    const provider = getProvider();
    if (!provider) {
      setError('Xverse Starknet provider is unavailable.');
      return;
    }
    try {
      const chainId = String(await provider.request({ type: 'wallet_requestChainId' }));
      const typedData = makeTypedData(chainId);
      const accounts = (await provider.request({ type: 'wallet_requestAccounts' })) as string[];
      const address = provider.selectedAddress ?? accounts[0];
      if (!address || !provider.provider) throw new Error('Starknet account is unavailable.');
      const signature = (await provider.request({
        type: 'wallet_signTypedData',
        params: typedData,
      })) as string[];
      const valid = await provider.provider.verifyMessageInStarknet(
        typedData,
        signature,
        address,
        'is_valid_signature',
      );
      setResponse(JSON.stringify({ signature, isValidSignature: valid }, null, 2));
      if (!valid) setError('The vault contract rejected the signature.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    }
  };

  return (
    <MethodLayout
      method="wallet_signTypedData (vault)"
      options={options}
      handleRequest={() => void handleRequest()}
      response={response}
      error={error}
    />
  );
}
