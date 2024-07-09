# Using sats-connect and Xverse to build a dapp

This is a simple example of how to use the sats-connect library to build a dapp. The dapp is a simple web application that allows users to send and receive btc and stx using the sats-connect library.

The dapp is built in typescript with Create-React-App.

# Installation and running the dapp

To install the node dependencies for the dapp, run the following command:

```bash
npm i
```

To run the dapp, run the following command:

```bash
npm start
```

The dapp should now be reachable in your browser on http://localhost:3001

# Using sats-connect

[Sats-connect](https://github.com/secretkeylabs/sats-connect) is an open source library which allows you to interact with the Xverse wallet from your dapp. The library exposes a `request` function which you can use to send requests to the Xverse wallet. The `request` function takes a `method` and `params` as arguments. The `method` is the name of the method you want to call in the Xverse wallet and the `params` is an object with the parameters typed specifically for the method.

If using typescript, the methods are typed and will come up in the intellisense of your IDE. Once you have typed a specific method, the params will be typed according to that method and will also come up in the intellisense.

The methods are namespaced according to the functionality they provide, with the exception of Bitcoin methods, which live in the global namespace. For example, to create a Bitcoin send transaction you would call `request('sendTransfer', { ... })`. To create a Stacks send transaction you would call `request('stx_transferStx', { ... })`.

The available Bitcoin methods are:

```
getInfo
getAddresses
signMessage
sendTransfer
signPsbt
```

The Stacks methods are:

```
stx_callContract
stx_deployContract
stx_getAccounts
stx_getAddresses
stx_signMessage
stx_signStructuredMessage
stx_signTransaction
stx_transferStx
```

There are also some more specialised methods exposed by sats connect which have not been migrated to the `request` function yet. One of these can be seen in the main App.tsx file, where we use the `getAddresses` method to get both the Bitcoin and Stacks addresses. However, these methods have a different calling convention using callback functions instead of promises.

# Happy Hacking

And buidl on! 🚀
