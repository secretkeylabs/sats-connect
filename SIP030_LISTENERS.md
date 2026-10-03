# SIP-030 network discovery and listeners

This companion to `secretkeylabs/sats-connect-core#131` exposes the same native wallet features through the top-level Sats Connect package. Xverse's injected provider implements `listen` directly; applications do not need `@stacks/connect` to access it. Sats Connect and Stacks Connect are alternative client libraries, not prerequisites for the wallet API.

## Default Wallet API

After the app has connected/obtained the necessary permissions and selected a wallet:

```ts
import Wallet from 'sats-connect';

const removeNetworkListener = Wallet.listen('stx_networkChange', (network) => {
  // network: { active, networks: { id, chainId, transactionVersion }[] }
  console.log(network.active);
});
const removeAccountListener = Wallet.listen('stx_accountChange', (accounts) => {
  // A bare Stacks accounts array, not the legacy accountChange envelope.
  console.log(accounts.map((account) => account.address));
});

// Subscribe first, then obtain the current network snapshot.
const response = await Wallet.request('stx_getNetworks', null);

// On component/page teardown:
removeNetworkListener();
removeAccountListener();
```

`Wallet.listen` is synchronous and returns the provider's unlisten function unchanged. It uses the instance's selected provider, or adopts the saved default if no provider has been selected on that instance. It **never** opens wallet-selection, approval or unlock UI. Select a provider first (for example, through the existing request/selection flow); missing selection or unsupported native listeners fail explicitly.

Adapters with `listen` are delegated to on a single instance. Unknown/request-only adapters can still use the injected provider's native `listen` through Core. No legacy-event translation, fabricated network/account data or automatic `stx_getAccounts` requests are performed. Existing `Wallet.addListener`, both of its calling conventions, and request/response payloads are unchanged.

## Named exports and direct providers

The named Core APIs and types are also re-exported:

```ts
import { listen, request } from 'sats-connect';

const remove = listen(
  'stx_networkChange',
  (network) => console.log(network.active),
  'XverseProviders.BitcoinProvider'
);
const response = await request('stx_getNetworks', null, 'XverseProviders.BitcoinProvider');
remove();
```

Named APIs resolve the supplied provider ID (or their existing default injected provider); they do not use the default `Wallet` object's private selection. `Wallet.listen` should be used when the app wants to honor that selection. Both event names have correctly correlated callback types via Core's `ListenEventMap`.

Applications can also call an updated wallet's injected `provider.listen` directly, independently of either client library. The availability of these methods still depends on the installed wallet version.

## Deliberate Xverse Gaia policy

For the new account event, Xverse supplies real public Stacks addresses/public keys but treats Gaia as deprecated: software and hardware accounts use a 64-character all-zero hexadecimal `gaiaAppKey` and `https://gaia.invalid` as a nonfunctional hub placeholder. These are not storage/authentication credentials. Other wallets may implement a different Gaia policy; Sats Connect forwards their native payloads without replacing fields.

Xverse suppresses account events while locked without triggering unlock/approval prompts. Connected origins without read permission for the selected account receive `[]`; missing Stacks address/public key also yields `[]`. This does not change existing explicit account requests or legacy events.

## Dependency rollout

Temporarily pin the verified published Core prerelease `0.19.0-d1718be`, which includes both SIP event contracts and `stx_getNetworks`. Update the manifest and lockfile to stable Core `0.19.0` once it is available. Do not ship a production release with an accidental older Core dependency or commit local tarball paths.

The package retains the already-planned, unpublished `sats-connect` version `4.3.0`; this PR does not overwrite a published stable version.

## Validation

- `npm run check-types`: source and positive/negative API type fixtures.
- `npm run test:listeners`: build and test the actual public package exports, selected-provider routing, cleanup/receiver forwarding, adapter/native dispatch, unsupported providers, no automatic UI/RPC calls, typed discovery and unchanged legacy listener behavior.
