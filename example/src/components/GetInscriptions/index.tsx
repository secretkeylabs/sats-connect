import Wallet, { RpcErrorCode } from 'sats-connect';

const GetInscriptions = () => {
  const onClick = async () => {
    const response = await Wallet.request('ord_getInscriptions', {
      limit: 100,
      offset: 0,
    });

    if (response.status === 'success') {
      console.log('inscriptions', response.result);
      alert('Success. See console for details.');
    } else if (response.error.code === RpcErrorCode.USER_REJECTION) {
      alert('User cancelled the request');
    } else {
      console.error(response.error);
      alert('Error getting inscriptions. See console for details.');
    }
  };

  return (
    <div className="card">
      <h3>Inscriptions</h3>

      <button onClick={onClick}>Get wallet inscriptions</button>
    </div>
  );
};

export default GetInscriptions;
