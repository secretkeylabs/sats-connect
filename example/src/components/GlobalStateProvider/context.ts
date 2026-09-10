import { createContext } from 'react';
import { Address, BitcoinNetworkType } from 'sats-connect';

export interface TGlobalStateContext {
  network: BitcoinNetworkType | null;
  networkError: string | null;
  accountId: string | null;
  btcAddressInfo: Address[];
  stxAddressInfo: Address[];
  sparkAddressInfo: Address[];
  starknetAddressInfo: Address[];

  isConnected: boolean;

  setAccountId: (id: string) => void;
  setBtcAddressInfo: (addresses: Address[]) => void;
  setStxAddressInfo: (addresses: Address[]) => void;
  setSparkAddressInfo: (addresses: Address[]) => void;
  setStarknetAddressInfo: (addresses: Address[]) => void;

  clearAppData: () => void;
  syncNetwork: () => Promise<boolean>;
  disconnect: () => void;
}

export const GlobalStateContext = createContext<TGlobalStateContext>({} as TGlobalStateContext);
