import { useState } from 'react';
import Wallet, { BitcoinNetworkType, RpcErrorCode } from 'sats-connect';

type Props = {
  network: BitcoinNetworkType;
};

const SendStx = ({ network }: Props) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [txnId, setTxnId] = useState('');

  const onClick = async () => {
    const response = await Wallet.request('stx_transferStx', {
      recipient: address,
      amount: +amount,
      memo: memo === '' ? undefined : memo,
    });

    if (response.status === 'success') {
      setTxnId(response.result.txid);
      setAmount('');
      setAddress('');
    } else if (response.error.code === RpcErrorCode.USER_REJECTION) {
      alert('User cancelled the request');
    } else {
      console.error(response.error);
      alert('Error sending STX. See console for details.');
    }
  };

  const explorerUrl =
    network === BitcoinNetworkType.Mainnet
      ? `https://explorer.hiro.so/txid/${txnId}`
      : `https://explorer.hiro.so/txid/${txnId}?chain=testnet`;

  return (
    <div className="card">
      <h3>Send STX</h3>
      {!txnId && (
        <>
          <div>
            <div>Amount (uSTX)</div>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <div>Address</div>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <div>Memo</div>
            <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} />
          </div>
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

export default SendStx;
