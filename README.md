![logo](/example/public/sats-connect.svg)

**[API Docs](https://docs.xverse.app/sats-connect) • [Example App](https://sats-connect.netlify.app/) • [Discord](https://discord.gg/tN84HhSDrz) • [Xverse](https://www.xverse.app/)**

[**Sats Connect**](https://github.com/secretkeylabs/sats-connect) is a simple javascript library that connects apps to **Bitcoin**, **Spark**, **Starknet**, **Stacks**, and other **Bitcoin Layer 2 wallets** like [**Xverse**](https://www.xverse.app/).&#x20;

It’s already powering apps across the BitcoinFi ecosystem, with close to **2 million downloads** — making it one of the most widely used ways for developers to integrate Bitcoin wallets today.

Developers building on Bitcoin and its L2s can use Sats Connect to interact directly with users’ wallets:

* 🔑 **Retrieve wallet addresses** for Bitcoin, Spark, Starknet, Stacks, and more
* ✍️ **Request signatures** of messages for authentication or verification
* 🔗 **Sign & send transactions**:
    * Bitcoin PSBTs
    * Spark BTC & token transfers
    * Starknet & Stacks transfers & contract calls
* 🖼️🔲🪙 **Ordinals, Runes & BRC-20**:
    * Track balances across assets
    * Transfer tokens and inscriptions
    * Inscribe sats with arbitrary content, create and mint tokens

## Quick start
```sh
npm i sats-connect
```
Then request a [wallet connection ](https://docs.xverse.app/sats-connect/connecting-to-the-wallet/connect-to-xverse-wallet)— and explore the docs to unlock the full Bitcoin stack: Bitcoin L1, Spark, Starknet, Stacks, and the assets built on top.

## Usage
### import
```sh
import { request } from 'sats-connect';
```
### Connect Wallet
```sh
const response = await request('getAccounts', {
  purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
  message: 'Cool app wants to know your addresses!',
});
```
### Request a wallet action
```sh
await request('sendTransfer', {...});
```

### Disconnect Wallet
```sh
await Wallet.disconnect();
```

## Development
### Build the package
```sh
npm run build
```
### Run example app
```sh
npm run dev:example
```

## Power your Bitcoin apps with plug-and-play infra

Sats Connect lets your app connect directly to users’ wallets.\
The [Xverse API](https://docs.xverse.app/api) gives you **plug-and-play access to Bitcoin data and infrastructure** — Ordinals, Runes, mempool, balances, transactions, collections, and more — without running your own nodes or indexers.

Together, they remove the heavy lifting so you can focus on building the next generation of Bitcoin apps.
