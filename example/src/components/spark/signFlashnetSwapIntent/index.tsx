import { useState } from 'react';
import { request } from 'sats-connect';
import { Button, Card, Input } from '../../../App.styles';
import { useGlobalState } from '../../GlobalStateProvider/use-global-state';

export const SignFlashnetSwapIntent = () => {
  const { sparkAddressInfo } = useGlobalState();
  const [signature, setSignature] = useState<string>('');

  const [amountIn, setAmountIn] = useState<string>('100000000');
  const [assetInAddress, setAssetInAddress] = useState<string>(
    '03bitcoinassetpubkey0000000000000000000000000000000000000000000000',
  );
  const [assetOutAddress, setAssetOutAddress] = useState<string>(
    '03usdstablecoinpubkey111111111111111111111111111111111111111111111',
  );
  const [minAmountOut, setMinAmountOut] = useState<string>('9000');
  const [maxSlippageBps, setMaxSlippageBps] = useState<number>(50);
  const [poolId, setPoolId] = useState<string>('example-pool-id');
  const [transferId, setTransferId] = useState<string>('123e4567-e89b-12d3-a456-426614174000');
  const [totalIntegratorFeeRateBps, setTotalIntegratorFeeRateBps] = useState<number>(10);

  const nonce = crypto.randomUUID();

  const onClick = () => {
    (async () => {
      const response = await request('spark_flashnet_signIntent', {
        type: 'executeSwap',
        data: {
          amountIn,
          assetInAddress,
          assetOutAddress,
          minAmountOut,
          maxSlippageBps,
          nonce,
          poolId,
          transferId,
          userPublicKey: sparkAddressInfo[0].publicKey,
          totalIntegratorFeeRateBps,
        },
      });

      if (response.status === 'error') {
        console.error(response.error);
        alert('Error signing Flashnet intent. See console for details.');
        return;
      }

      console.log(response.result);
      setSignature(response.result.signature);
    })().catch(console.error);
  };

  if (sparkAddressInfo.length === 0) {
    return <div>Please connect your Spark wallet to use this feature.</div>;
  }

  return (
    <Card>
      <h3>Sign Flashnet Swap Intent</h3>
      <div>
        <div>Amount In</div>
        <Input type="number" value={amountIn} onChange={(e) => setAmountIn(e.target.value)} />
      </div>
      <div>
        <div>Asset In Address</div>
        <Input
          type="text"
          value={assetInAddress}
          onChange={(e) => setAssetInAddress(e.target.value)}
        />
      </div>
      <div>
        <div>Asset Out Address</div>
        <Input
          type="text"
          value={assetOutAddress}
          onChange={(e) => setAssetOutAddress(e.target.value)}
        />
      </div>
      <div>
        <div>Min Amount Out</div>
        <Input
          type="number"
          value={minAmountOut}
          onChange={(e) => setMinAmountOut(e.target.value)}
        />
      </div>
      <div>
        <div>Max Slippage (bps)</div>
        <Input
          type="number"
          value={maxSlippageBps}
          onChange={(e) => setMaxSlippageBps(Number(e.target.value))}
        />
      </div>
      <div>
        <div>Nonce</div>
        <div>{nonce}</div>
      </div>
      <div>
        <div>Pool ID</div>
        <Input type="text" value={poolId} onChange={(e) => setPoolId(e.target.value)} />
      </div>
      <div>
        <div>Transfer ID</div>
        <Input type="text" value={transferId} onChange={(e) => setTransferId(e.target.value)} />
      </div>
      <div>
        <div>Total Integrator Fee Rate (bps)</div>
        <Input
          type="number"
          value={totalIntegratorFeeRateBps}
          onChange={(e) => setTotalIntegratorFeeRateBps(Number(e.target.value))}
        />
      </div>
      <Button onClick={onClick}>Call spark_flashnet_signIntent</Button>
      {signature && (
        <div>
          <div>Signature</div>
          <div>{signature}</div>
        </div>
      )}
    </Card>
  );
};
