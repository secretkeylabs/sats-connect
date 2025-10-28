import { useState } from 'react';
import { request } from 'sats-connect';
import { Button, Card, Input, Success } from '../../../App.styles';
import { useGlobalState } from '../../GlobalStateProvider/use-global-state';

export const ExecuteFlashnetSwap = () => {
  const { sparkAddressInfo } = useGlobalState();
  const [swapTxId, setSwapTxId] = useState<string>('');

  const [amountIn, setAmountIn] = useState<string>('8500');
  const [assetInAddress, setAssetInAddress] = useState<string>(
    '020202020202020202020202020202020202020202020202020202020202020202',
  );
  const [assetOutAddress, setAssetOutAddress] = useState<string>(
    '08998b78c25974c956e5ea264e54b15fba5937156464a146714c2b877f002903',
  );
  const [minAmountOut, setMinAmountOut] = useState<string>('1200');
  const [maxSlippageBps, setMaxSlippageBps] = useState<number>(2);
  const [poolId, setPoolId] = useState<string>(
    '0368c9dc958657728456e14bedd746cefc381b409e9b6cbd895b25ae5f21c00336',
  );

  const nonce = crypto.randomUUID();

  const onClick = () => {
    (async () => {
      const response = await request('spark_flashnet_executeSwap', {
        amountIn,
        assetInAddress,
        assetOutAddress,
        minAmountOut,
        maxSlippageBps,
        poolId,
      });

      if (response.status === 'error') {
        console.error(response.error);
        alert('Error signing Flashnet intent. See console for details.');
        return;
      }

      console.log(response.result);
      setSwapTxId(response.result.outboundTransferId ?? 'ok');
    })().catch(console.error);
  };

  if (sparkAddressInfo.length === 0) {
    return <div>Please connect your Spark wallet to use this feature.</div>;
  }

  return (
    <Card>
      <h3>Execute Swap</h3>
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
      <Button onClick={onClick}>Call spark_flashnet_executeSwap</Button>
      {swapTxId && (
        <Success>
          Success!{' '}
          {swapTxId !== 'ok' && (
            <>
              Click{' '}
              <a
                href={`https://www.sparkscan.io/tx/${swapTxId}?network=mainnet`}
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>{' '}
              to see your transaction
            </>
          )}
        </Success>
      )}
    </Card>
  );
};
