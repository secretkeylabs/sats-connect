import { useCallback, useMemo, useState } from 'react';
import Wallet, { Address, AddressPurpose, BitcoinNetworkType } from 'sats-connect';
import { Button, Card, H4, Input, Success } from '../../App.styles';

interface Props {
  network: BitcoinNetworkType;
  addresses: Address[];
}

export const MintRunes = ({ addresses, network }: Props) => {
  const [totalCost, setTotalCost] = useState<number>();
  const [totalSize, setTotalSize] = useState<number>();
  const [fundTxId, setFundTxId] = useState<string>('');
  const [runeName, setRuneName] = useState<string>('');
  const [feeRate, setFeeRate] = useState<string>('');
  const [repeats, setRepeats] = useState<string>('');

  const ordinalsAddress = useMemo(
    () => addresses.find((a) => a.purpose === AddressPurpose.Ordinals)?.address ?? '',
    [addresses],
  );

  const paymentAddress = useMemo(
    () => addresses.find((a) => a.purpose === AddressPurpose.Payment)?.address ?? '',
    [addresses],
  );

  const onClickEstimate = useCallback(() => {
    (async () => {
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
        alert(`Error estimating ${runeName} mint. See console for details.`);
      }
    })().catch(console.error);
  }, [feeRate, ordinalsAddress, repeats, runeName, network]);

  const onClickExecute = useCallback(() => {
    (async () => {
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
        alert(`Error executing ${runeName} mint. See console for details.`);
      }
    })().catch(console.error);
  }, [feeRate, network, ordinalsAddress, paymentAddress, repeats, runeName]);

  const networkPath = {
    [BitcoinNetworkType.Mainnet]: '',
    [BitcoinNetworkType.Testnet]: '/testnet',
    [BitcoinNetworkType.Signet]: '/signet',
  };
  const fundTxLink = `https://mempool.space${networkPath[network]}/tx/${fundTxId}`;

  return (
    <>
      <Card>
        <h3>Mint Runes</h3>
        <div>
          <H4>feeRate (sats/vb)</H4>
          <Input type="number" value={feeRate} onChange={(e) => setFeeRate(e.target.value)} />
        </div>
        <div>
          <H4>Rune Name</H4>
          <Input type="text" value={runeName} onChange={(e) => setRuneName(e.target.value)} />
        </div>
        <div>
          <H4>Repeat</H4>
          <Input type="number" value={repeats} onChange={(e) => setRepeats(e.target.value)} />
        </div>
        <Button onClick={onClickEstimate} disabled={!runeName || !feeRate || !repeats}>
          Estimate Mint
        </Button>
      </Card>

      {totalCost && (
        <Card>
          <div>
            <h3>Rune Name</h3>
            <Success>{runeName}</Success>
          </div>
          <div>
            <h3>Repeat</h3>
            <Success>{repeats}</Success>
          </div>
          <div>
            <h3>Total Cost (sats) - Total Size</h3>
            <Success>
              {totalCost} - {totalSize}
            </Success>
          </div>
          <Button onClick={onClickExecute}>Execute Mint</Button>
          {fundTxId && (
            <Success>
              Success! Click{' '}
              <a href={fundTxLink} target="_blank" rel="noreferrer">
                here
              </a>{' '}
              to see your transaction
            </Success>
          )}
        </Card>
      )}
    </>
  );
};

export default MintRunes;
