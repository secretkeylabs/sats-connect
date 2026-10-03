import Wallet, {
  listen,
  type StacksAccountChangeResult,
  type StacksGetNetworksResult,
} from '../src';

// Compile-only fixtures: named and default APIs keep event/callback types correlated.
export async function checkListenerTypes() {
  const removeNetwork: () => void = Wallet.listen('stx_networkChange', (result) => {
    const network: StacksGetNetworksResult = result;
    return network;
  });
  const removeAccounts: () => void = Wallet.listen('stx_accountChange', (result) => {
    const accounts: StacksAccountChangeResult = result;
    return accounts;
  });
  listen('stx_accountChange', (accounts) => accounts.map((account) => account.address));
  listen('stx_networkChange', (network) => network.active, 'XverseProviders.BitcoinProvider');

  // @ts-expect-error Account events cannot use a network callback.
  Wallet.listen('stx_accountChange', (_result: StacksGetNetworksResult) => {});
  // @ts-expect-error Network events cannot use an account callback.
  Wallet.listen('stx_networkChange', (_result: StacksAccountChangeResult) => {});
  // @ts-expect-error Unsupported SIP event names are rejected at compile time.
  Wallet.listen('accountChange', () => {});
  // @ts-expect-error Named exports retain the same event/callback correlation.
  listen('stx_accountChange', (_result: StacksGetNetworksResult) => {});

  const response = await Wallet.request('stx_getNetworks', null);
  if (response.status === 'success') {
    const active: string = response.result.active;
    const chainId: number = response.result.networks[0].chainId;
    const transactionVersion: number = response.result.networks[0].transactionVersion;
    return { active, chainId, transactionVersion, removeNetwork, removeAccounts };
  }
}
