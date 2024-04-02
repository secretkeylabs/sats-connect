import { useState } from 'react';
import Wallet, { BitcoinNetworkType, RpcErrorCode } from 'sats-connect';

type Props = {
  network: BitcoinNetworkType;
};

const SendBtc = ({ network }: Props) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [txnId, setTxnId] = useState('');

  const onClick = async () => {
    const response = await Wallet.request('sendTransfer', {
      recipients: [
        {
          address: address,
          amount: +amount,
        },
      ],
    });

    if (response.status === 'success') {
      setTxnId(response.result.txid);
      setAmount('');
      setAddress('');
    } else if (response.error.code === RpcErrorCode.USER_REJECTION) {
      alert('User cancelled the request');
    } else {
      console.error(response.error);
      alert('Error sending BTC. See console for details.');
    }
  };

  const explorerUrl =
    network === BitcoinNetworkType.Mainnet
      ? `https://mempool.space/tx/${txnId}`
      : `https://mempool.space/testnet/tx/${txnId}`;

  return (
    <div className="card">
      <h3>Send BTC</h3>
      {!txnId && (
        <>
          <p>
            <div>Amount (sats)</div>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </p>
          <p>
            <div>Address</div>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </p>
          <button onClick={onClick} disabled={!amount || !address}>
            Send
          </button>
        </>
      )}
      {txnId && (
        <div className="success">
          Success! Click{' '}
          <a href={explorerUrl} target="_blank" rel="noreferrer">
            here
          </a>{' '}
          to see your transaction
        </div>
      )}
    </div>
  );
};

export default SendBtc;
