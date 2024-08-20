import { useCallback, useMemo, useState } from 'react';
import Wallet, { Address, AddressPurpose, BitcoinNetworkType } from 'sats-connect';
import { Button, Card, H4, Input, Success } from '../../App.styles';
import { Container } from './index.styles';

interface Props {
  network: BitcoinNetworkType;
  addresses: Address[];
}

export const EtchRunes = ({ addresses, network }: Props) => {
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
  const [delegateInscription, setDelegateInscription] = useState<string>('');
  const [inscriptionContentType, setInscriptionContentType] = useState<string>('');
  const [inscriptionContent, setInscriptionContent] = useState<string>('');

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
      const response = await Wallet.request('runes_estimateEtch', {
        destinationAddress: ordinalsAddress,
        feeRate: +feeRate,
        symbol: symbol || undefined,
        premine: preMine || undefined,
        divisibility: +divisibility || undefined,
        delegateInscriptionId: delegateInscription || undefined,
        inscriptionDetails:
          inscriptionContent && inscriptionContentType
            ? {
                contentBase64: inscriptionContent,
                contentType: inscriptionContentType,
              }
            : undefined,
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
    })().catch(console.error);
  }, [
    amount,
    delegateInscription,
    divisibility,
    feeRate,
    inscriptionContent,
    inscriptionContentType,
    mintCap,
    network,
    ordinalsAddress,
    preMine,
    runeName,
    symbol,
  ]);

  const onClickExecute = useCallback(() => {
    (async () => {
      const response = await Wallet.request('runes_etch', {
        destinationAddress: ordinalsAddress,
        symbol: symbol || undefined,
        premine: preMine || undefined,
        delegateInscriptionId: delegateInscription || undefined,
        inscriptionDetails:
          inscriptionContent && inscriptionContentType
            ? {
                contentBase64: inscriptionContent,
                contentType: inscriptionContentType,
              }
            : undefined,
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
    })().catch(console.error);
  }, [
    amount,
    delegateInscription,
    feeRate,
    inscriptionContent,
    inscriptionContentType,
    mintCap,
    network,
    ordinalsAddress,
    paymentAddress,
    preMine,
    runeName,
    symbol,
  ]);

  const networkPath = {
    [BitcoinNetworkType.Mainnet]: '',
    [BitcoinNetworkType.Testnet]: '/testnet',
    [BitcoinNetworkType.Signet]: '/signet',
  };
  const fundTxLink = `https://mempool.space${networkPath[network]}/tx/${fundTxId}`;

  return (
    <>
      <Card>
        <h3>Etch Runes</h3>
        <Container>
          <div>
            <H4>Rune Name</H4>
            <Input type="text" value={runeName} onChange={(e) => setRuneName(e.target.value)} />
          </div>
          <div>
            <H4>Symbol</H4>
            <Input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </div>
          <div>
            <H4>Delegate inscription</H4>
            <Input
              type="text"
              value={delegateInscription}
              onChange={(e) => setDelegateInscription(e.target.value)}
            />
          </div>
          <div>
            <H4>Inscription Content</H4>
            <Input
              type="text"
              value={inscriptionContent}
              onChange={(e) => setInscriptionContent(e.target.value)}
            />
          </div>
          <div>
            <H4>Inscription Content type</H4>
            <Input
              type="text"
              value={inscriptionContentType}
              onChange={(e) => setInscriptionContentType(e.target.value)}
            />
          </div>
          <div>
            <h4>Divisibility</h4>
            <Input
              type="number"
              value={divisibility}
              onChange={(e) => setDivisibility(e.target.value)}
            />
          </div>
          <div>
            <H4>Premine</H4>
            <Input type="number" value={preMine} onChange={(e) => setPreMine(e.target.value)} />
          </div>
          <div>
            <H4>Amount</H4>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <H4>Mint Cap</H4>
            <Input type="number" value={mintCap} onChange={(e) => setMintCap(e.target.value)} />
          </div>
          <div>
            <H4>feeRate (sats/vb)</H4>
            <Input type="number" value={feeRate} onChange={(e) => setFeeRate(e.target.value)} />
          </div>
        </Container>

        <Button onClick={onClickEstimate} disabled={!runeName || !feeRate}>
          Estimate Etch
        </Button>
      </Card>

      {totalCost && (
        <Card>
          <div>
            <h3>Rune Name</h3>
            <Success>{runeName}</Success>
          </div>
          <div>
            <h3>Total Cost (sats) - Total Size</h3>
            <Success>
              {totalCost} - {totalSize}
            </Success>
          </div>
          <Button onClick={onClickExecute}>Execute Etch</Button>
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

export default EtchRunes;
