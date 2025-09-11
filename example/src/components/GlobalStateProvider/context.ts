import { Address, BitcoinNetworkType } from '@sats-connect/core';
import { createContext } from 'react';

export interface TGlobalStateContext {
  network: BitcoinNetworkType;
  accountId: string | null;
  btcAddressInfo: Address[];
  stxAddressInfo: Address[];
  sparkAddressInfo: Address[];
  starknetAddressInfo: Address[];

  isConnected: boolean;

  setNetwork: (newValue: BitcoinNetworkType) => void;
  setAccountId: (id: string) => void;
  setBtcAddressInfo: (addresses: Address[]) => void;
  setStxAddressInfo: (addresses: Address[]) => void;
  setSparkAddressInfo: (addresses: Address[]) => void;
  setStarknetAddressInfo: (addresses: Address[]) => void;

  clearAppData: () => void;
  disconnect: () => void;
}

export const GlobalStateContext = createContext<TGlobalStateContext>({} as TGlobalStateContext);
