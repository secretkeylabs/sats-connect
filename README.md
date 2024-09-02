![logo](/example/public/sats-connect.svg)

**[API Docs](https://docs.xverse.app/sats-connect) • [Example App](https://sats-connect.netlify.app/) • [Discord](https://discord.gg/tN84HhSDrz) • [Xverse](https://www.xverse.app/)**

Sats connect is a simple javascript library that connects apps to Bitcoin wallets like Xverse to retrieve user wallet addresses and sign transactions (PSBTs).

Developers building apps on the Bitcoin ecosystem can use Sats connect to interact with users' wallets:

1. Retrieve users' wallet address(es)

2. Request the signature of arbitrary messages for authentication purposes

3. Request the signature of partially signed Bitcoin transactions (PSBT)

4. Request BTC or Stacks transfers to one or multiple recipients

5. Request Stacks contract interactions and deployments

6. Inscribe sats with arbitrary content for ordinals & BRC-20 use cases

## Quick start

```bash
npm i sats-connect
```

## Usage

### import

```ts
import Wallet from 'sats-connect';
```

### Connect Wallet

```ts
const response = await Wallet.request('getAccounts', {
  purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
  message: 'Cool app wants to know your addresses!',
});
```

### Request a wallet action

```ts
await Wallet.request('sendTransfer', {...});
```

### Disconnect Wallet

```ts
await Wallet.disconnect();
```

## Documentation

For full documentation, visit [docs.xverse.app](https://docs.xverse.app/sats-connect/).

## Development

### Build the package

```bash
npm run build
```

### Run example app

```bash
npm run dev:example
```
