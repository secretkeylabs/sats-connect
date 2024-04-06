import { useMemo, useState } from 'react';
import Wallet, { Address, AddressPurpose, BitcoinNetworkType } from 'sats-connect';

type Props = {
  network: BitcoinNetworkType;
  addresses: Address[];
};

const MintRunes = ({ addresses, network }: Props) => {
  const [totalCost, setTotalCost] = useState<number>();
  const [totalSize, setTotalSize] = useState<number>();
  const [fundTxId, setFundTxId] = useState<string>('');
  const [runeName, setRuneName] = useState<string>('');
  const [feeRate, setFeeRate] = useState<string>('');
  const [repeats, setRepeats] = useState<string>('');

  const ordinalsAddress = useMemo(
    () => addresses.find((a) => a.purpose === AddressPurpose.Ordinals)?.address || '',
    [addresses]
  );

  const paymentAddress = useMemo(
    () => addresses.find((a) => a.purpose === AddressPurpose.Payment)?.address || '',
    [addresses]
  );

  const onClickEstimate = async () => {
    const response = await Wallet.request('runes_estimateMint', {
      destinationAddress: ordinalsAddress,
      feeRate: +feeRate,
      repeats: +repeats,
      runeName: runeName,
      network: network,
    });

    if (response.status === 'success') {
      setTotalCost(response.result.totalCost);
      setTotalSize(response.result.totalSize);
    } else {
      console.error(response.error);
      alert('Error Fetching Estimate. See console for details.');
    }
  };

  const onClickExecute = async () => {
    const response = await Wallet.request('runes_mint', {
      destinationAddress: ordinalsAddress,
      feeRate: +feeRate,
      repeats: +repeats,
      runeName,
      refundAddress: paymentAddress,
      network,
    });

    if (response.status === 'success') {
      setFundTxId(response.result.fundTransactionId);
    } else {
      console.error(response.error);
      alert('Error sending BTC. See console for details.');
    }
  };

  const fundTxLink =
    network === BitcoinNetworkType.Mainnet
      ? `https://mempool.space/tx/${fundTxId}`
      : `https://mempool.space/testnet/tx/${fundTxId}`;

  return (
    <>
      <div className="card">
        <h3>Mint Runes</h3>
        <div>
          <h4>feeRate (sats/vb)</h4>
          <input type="number" value={feeRate} onChange={(e) => setFeeRate(e.target.value)} />
        </div>
        <div>
          <h4>Rune Name</h4>
          <input type="text" value={runeName} onChange={(e) => setRuneName(e.target.value)} />
        </div>
        <div>
          <h4>Repeat</h4>
          <input type="number" value={repeats} onChange={(e) => setRepeats(e.target.value)} />
        </div>
        <button onClick={onClickEstimate} disabled={!runeName || !feeRate || !repeats}>
          Estimate Mint
        </button>
      </div>

      {totalCost && (
        <div className="card">
          <div>
            <h3>Rune Name</h3>
            <p className="success">{runeName}</p>
          </div>
          <div>
            <h3>Repeat</h3>
            <p className="success">{repeats}</p>
          </div>
          <div>
            <h3>Total Cost (sats) - Total Size</h3>
            <p className="success">
              {totalCost} - {totalSize}
            </p>
          </div>
          <button onClick={onClickExecute}>Execute Mint</button>
          {fundTxId && (
            <div className="success">
              Success! Click{' '}
              <a href={fundTxLink} target="_blank" rel="noreferrer">
                here
              </a>{' '}
              to see your transaction
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MintRunes;
