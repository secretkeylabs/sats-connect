import { useMemo, useState } from 'react';
import Wallet, { Address, AddressPurpose, BitcoinNetworkType } from 'sats-connect';

type Props = {
  network: BitcoinNetworkType;
  addresses: Address[];
};

const EtchRunes = ({ addresses, network }: Props) => {
  const [totalCost, setTotalCost] = useState<number>();
  const [totalSize, setTotalSize] = useState<number>();
  const [fundTxId, setFundTxId] = useState<string>('');
  const [runeName, setRuneName] = useState<string>('');
  const [feeRate, setFeeRate] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [preMine, setPreMine] = useState<string>('');
  const [divisibility, setDivisibility] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [mintCap, setMintCap] = useState<string>('');

  const ordinalsAddress = useMemo(
    () => addresses.find((a) => a.purpose === AddressPurpose.Ordinals)?.address || '',
    [addresses]
  );

  const paymentAddress = useMemo(
    () => addresses.find((a) => a.purpose === AddressPurpose.Payment)?.address || '',
    [addresses]
  );

  const onClickEstimate = async () => {
    const response = await Wallet.request('runes_estimateEtch', {
      destinationAddress: ordinalsAddress,
      feeRate: +feeRate,
      symbol: symbol || undefined,
      premine: preMine || undefined,
      divisibility: +divisibility || undefined,
      terms:
        amount || mintCap
          ? {
              amount: amount || undefined,
              cap: mintCap || undefined,
            }
          : undefined,
      isMintable: true,
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
    const response = await Wallet.request('runes_etch', {
      destinationAddress: ordinalsAddress,
      symbol: symbol || undefined,
      premine: preMine || undefined,
      terms:
        amount || mintCap
          ? {
              amount: amount || undefined,
              cap: mintCap || undefined,
            }
          : undefined,
      feeRate: +feeRate,
      isMintable: true,
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
        <h3>Etch Runes</h3>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingRight: 100,
            marginBottom: 20,
          }}
        >
          <div>
            <h4>Rune Name</h4>
            <input type="text" value={runeName} onChange={(e) => setRuneName(e.target.value)} />
          </div>
          <div>
            <h4>Symbol</h4>
            <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </div>
          <div>
            <h4>Divisibility</h4>
            <input
              type="number"
              value={divisibility}
              onChange={(e) => setDivisibility(e.target.value)}
            />
          </div>
          <div>
            <h4>Premine</h4>
            <input type="number" value={preMine} onChange={(e) => setPreMine(e.target.value)} />
          </div>
          <div>
            <h4>Amount</h4>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <h4>Mint Cap</h4>
            <input type="number" value={mintCap} onChange={(e) => setMintCap(e.target.value)} />
          </div>
          <div>
            <h4>feeRate (sats/vb)</h4>
            <input type="number" value={feeRate} onChange={(e) => setFeeRate(e.target.value)} />
          </div>
        </div>

        <button onClick={onClickEstimate} disabled={!runeName || !feeRate}>
          Estimate Etch
        </button>
      </div>

      {totalCost && (
        <div className="card">
          <div>
            <h3>Rune Name</h3>
            <p className="success">{runeName}</p>
          </div>
          <div>
            <h3>Total Cost (sats) - Total Size</h3>
            <p className="success">
              {totalCost} - {totalSize}
            </p>
          </div>
          <button onClick={onClickExecute}>Execute Etch</button>
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

export default EtchRunes;
