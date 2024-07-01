import { useState } from 'react';
import Wallet, { RpcErrorCode } from 'sats-connect';

const GetBtcBalance = () => {
  const [confirmed, setConfirmed] = useState('');
  const [unconfirmed, setUnconfirmed] = useState('');
  const [total, setTotal] = useState('');

  const onClick = async () => {
    const response = await Wallet.request('getBalance', undefined);

    if (response.status === 'success') {
      setConfirmed(response.result.confirmed);
      setUnconfirmed(response.result.unconfirmed);
      setTotal(response.result.total);
    } else if (response.error.code === RpcErrorCode.USER_REJECTION) {
      alert('User cancelled the request');
    } else {
      console.error(response.error);
      alert('Error sending BTC. See console for details.');
    }
  };

  return (
    <div className="card">
      <h3>BTC balance</h3>

      <button onClick={onClick}>Get BTC balance</button>

      <div>
        <div>Confirmed: {confirmed}</div>
        <div>Unconfirmed: {unconfirmed}</div>
        <div>Total: {total}</div>
      </div>
    </div>
  );
};

export default GetBtcBalance;
