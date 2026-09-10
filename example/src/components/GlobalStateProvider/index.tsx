import { useQueryClient } from '@tanstack/react-query';
import { PropsWithChildren, useCallback, useState } from 'react';
import Wallet, {
  Address,
  BitcoinNetworkType,
  RpcErrorCode,
  type WalletRequestPermissionsParams,
} from 'sats-connect';
import { GlobalStateContext } from './context';
export function GlobalStateProvider({ children }: PropsWithChildren) {
  const [network, setNetwork] = useState<BitcoinNetworkType | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [btcAddressInfo, setBtcAddressInfo] = useState<Address[]>([]);
  const [stxAddressInfo, setStxAddressInfo] = useState<Address[]>([]);
  const [sparkAddressInfo, setSparkAddressInfo] = useState<Address[]>([]);
  const [starknetAddressInfo, setStarknetAddressInfo] = useState<Address[]>([]);

  const queryClient = useQueryClient();
  const clearAppData = useCallback(() => {
    setAccountId(null);
    setBtcAddressInfo([]);
    setStxAddressInfo([]);
    setNetwork(null);
    setNetworkError(null);
    queryClient.clear();
  }, [queryClient, setBtcAddressInfo, setStxAddressInfo, setAccountId]);
  const syncNetwork = useCallback(async () => {
    setNetwork(null);
    setNetworkError(null);

    let response = await Wallet.request('wallet_getNetwork', null);
    if (
      response.status === 'error' &&
      response.error.code === (RpcErrorCode.ACCESS_DENIED as number)
    ) {
      const permissions: WalletRequestPermissionsParams = [
        {
          type: 'wallet',
          resourceId: 'wallet',
          actions: { readNetwork: true },
        },
      ];
      const permissionResponse = await Wallet.request('wallet_requestPermissions', permissions);
      if (permissionResponse.status === 'success') {
        response = await Wallet.request('wallet_getNetwork', null);
      }
    }

    if (response.status === 'error') {
      console.error('Error getting wallet network.', response);
      setNetworkError('Unable to read the wallet network. Network-dependent actions are disabled.');
      return false;
    }

    setNetwork(response.result.bitcoin.name);
    return true;
  }, []);
  const disconnect = useCallback(() => {
    (async () => {
      await Wallet.disconnect();
      clearAppData();
    })().catch(console.error);
  }, [clearAppData]);

  const isConnected = btcAddressInfo.length + stxAddressInfo.length > 0;

  return (
    <GlobalStateContext.Provider
      value={{
        network,
        networkError,
        accountId,
        btcAddressInfo,
        stxAddressInfo,
        sparkAddressInfo,
        starknetAddressInfo,

        isConnected,

        setAccountId,
        setBtcAddressInfo,
        setStxAddressInfo,
        setSparkAddressInfo,
        setStarknetAddressInfo,

        clearAppData,
        syncNetwork,
        disconnect,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
}
