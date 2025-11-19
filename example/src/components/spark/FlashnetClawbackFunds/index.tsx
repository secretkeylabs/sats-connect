import { useState } from 'react';
import { BitcoinNetworkType, request } from 'sats-connect';
import { Button, Card, Input, Success } from '../../../App.styles';
import { useGlobalState } from '../../GlobalStateProvider/use-global-state';

interface Props {
  network: BitcoinNetworkType;
}

export const FlashnetClawbackFunds = ({ network }: Props) => {
  const { sparkAddressInfo } = useGlobalState();
  const [sparkStatusTrackingId, setSparkStatusTrackingId] = useState<string>('');

  const [sparkTransferId, setSparkTransferId] = useState<string>('');
  const [lpIdentityPublicKey, setLpIdentityPublicKey] = useState<string>('');

  const onClick = () => {
    (async () => {
      const response = await request('spark_flashnet_clawbackFunds', {
        sparkTransferId,
        lpIdentityPublicKey,
      });

      console.log(response);

      if (response.status === 'error') {
        console.error(response.error);
        alert('Error clawing back funds. See console for details.');
        return;
      }

      if (response.result.error) {
        console.error(response.result.error);
        alert('Error clawing back funds. See console for details.');
        return;
      }

      console.log(response.result);
      setSparkStatusTrackingId(response.result.sparkStatusTrackingId ?? '');
    })().catch(console.error);
  };

  if (sparkAddressInfo.length === 0) {
    return <div>Please connect your Spark wallet to use this feature.</div>;
  }

  const explorerUrl = `https://www.sparkscan.io/tx/${sparkStatusTrackingId}?network=${network === BitcoinNetworkType.Mainnet ? 'mainnet' : 'regtest'}`;

  return (
    <Card>
      <h3>Clawback Funds</h3>
      <div>
        <div>Spark Transfer ID</div>
        <Input
          type="text"
          value={sparkTransferId}
          onChange={(e) => setSparkTransferId(e.target.value)}
        />
      </div>
      <div>
        <div>LP Identity Public Key</div>
        <Input
          type="text"
          value={lpIdentityPublicKey}
          onChange={(e) => setLpIdentityPublicKey(e.target.value)}
        />
      </div>

      <Button onClick={onClick}>Call spark_flashnet_clawbackFunds</Button>
      {sparkStatusTrackingId && (
        <>
          <div>
            <div>Spark Status Tracking ID</div>
            <div>{sparkStatusTrackingId}</div>
          </div>
          <Success>
            Success!{' '}
            {sparkStatusTrackingId !== 'ok' && (
              <>
                Click{' '}
                <a href={explorerUrl} target="_blank" rel="noreferrer">
                  here
                </a>{' '}
                to see your transaction
              </>
            )}
          </Success>
        </>
      )}
    </Card>
  );
};
