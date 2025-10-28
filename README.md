![logo](/example/public/sats-connect.svg)

**[API Docs](https://docs.xverse.app/sats-connect) • [Example App](https://sats-connect.netlify.app/) • [Discord](https://discord.gg/tN84HhSDrz) • [Xverse](https://www.xverse.app/)**

# 👋 Introduction

[**Sats Connect**](https://github.com/secretkeylabs/sats-connect) is a simple javascript library that connects apps to **Bitcoin**, **Spark**, **Starknet**, **Stacks**, and other **Bitcoin Layer 2 wallets** like [**Xverse**](https://www.xverse.app/).&#x20;

It’s already powering apps across the BitcoinFi ecosystem, with close to **2 million downloads** — making it one of the most widely used ways for developers to integrate Bitcoin wallets today.

## ✨ What you can do with Sats Connect

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

## 🛠️ Why Sats Connect?

* **Wallet-first** – every interaction happens directly in the user’s wallet, with explicit approval
* **Bitcoin-native & multi-asset** – supports Bitcoin L1 (BTC, Ordinals, Runes, BRC-20) as well as emerging L2s like Spark, Starknet, and Stacks
* **Comprehensive toolkit** – from simple address retrieval to advanced features like signing PSBTs, transferring Spark tokens, or inscribing Ordinals
* **Battle-tested** – trusted by leading BitcoinFi apps, with close to **2M downloads** and a growing developer ecosystem

## 🚀 Get started
```bash
npm i sats-connect@4.2.x
```
Then request a [wallet connection ](https://docs.xverse.app/sats-connect/connecting-to-the-wallet/connect-to-xverse-wallet)— and explore the docs to unlock the full Bitcoin stack: Bitcoin L1, Spark, Starknet, Stacks, and the assets built on top.

## 💻 Usage
### import
```ts
import { request } from 'sats-connect';
```
### Connect Wallet
```ts
const response = await request('getAccounts', {
  purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
  message: 'Cool app wants to know your addresses!',
});
```
### Request a wallet action
```ts
await request('sendTransfer', {...});
```

### Disconnect Wallet
```ts
await Wallet.disconnect();
```

## 💻 Development
### Build the package
```bash
npm run build
```
### Run example app
```bash
npm run dev:example
```

## 📚 Documentation
For full documentation, visit [docs.xverse.app](https://docs.xverse.app/sats-connect/).

## ⚡ Power your Bitcoin apps with plug-and-play infra
Sats Connect lets your app connect directly to users’ wallets.\
The [Xverse API](https://docs.xverse.app/api) gives you **plug-and-play access to Bitcoin data and infrastructure** — Ordinals, Runes, mempool, balances, transactions, collections, and more — without running your own nodes or indexers.

Together, they remove the heavy lifting so you can focus on building the next generation of Bitcoin apps.

## 🤝 Join the community
If you’re building with Sats Connect or Xverse API and need help with integration, join our [developer forum](https://discord.gg/tN84HhSDrz) to connect with the community and the Xverse team.&#x20;
