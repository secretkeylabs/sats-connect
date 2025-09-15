import { Address, BitcoinNetworkType } from '@sats-connect/core';
import { useQueryClient } from '@tanstack/react-query';
import { PropsWithChildren, useCallback, useState } from 'react';
import Wallet from 'sats-connect';
import { useLocalStorage } from '../../hooks';
import { GlobalStateContext } from './context';
export function GlobalStateProvider({ children }: PropsWithChildren) {
  const [network, setNetwork] = useLocalStorage<BitcoinNetworkType>(
    'network',
    BitcoinNetworkType.Mainnet,
  );
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
    queryClient.clear();
  }, [queryClient, setBtcAddressInfo, setStxAddressInfo, setAccountId]);
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
        accountId,
        btcAddressInfo,
        stxAddressInfo,
        sparkAddressInfo,
        starknetAddressInfo,

        isConnected,

        setNetwork,
        setAccountId,
        setBtcAddressInfo,
        setStxAddressInfo,
        setSparkAddressInfo,
        setStarknetAddressInfo,

        clearAppData,
        disconnect,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
}
