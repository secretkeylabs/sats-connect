import { useCallback, useState } from 'react';
import { request, type SparkGetClawbackEligibleTransfersResult } from 'sats-connect';
import { Button, Card } from '../../../App.styles';
import { useGlobalState } from '../../GlobalStateProvider/use-global-state';

export const GetClawbackEligibleTransfers = () => {
  const { sparkAddressInfo } = useGlobalState();
  const [transactions, setTransactions] = useState<
    SparkGetClawbackEligibleTransfersResult['eligibleTransfers']
  >([]);

  const onClick = useCallback(() => {
    (async () => {
      const response = await request('spark_flashnet_getClawbackEligibleTransfers', null);

      if (response.status === 'error') {
        console.error(response.error);
        alert('Error retrieving eligible clawback transactions. See console for details.');
        return;
      }

      console.log(response.result);
      setTransactions(response.result.eligibleTransfers);
    })().catch(console.error);
  }, []);

  if (sparkAddressInfo.length === 0) {
    return <div>Please connect your Spark wallet to use this feature.</div>;
  }

  return (
    <Card>
      <h3>Get Eligible Clawback Transactions</h3>
      {transactions && transactions.length > 0 && (
        <>
          <div>Found {transactions.length} eligible transaction(s)</div>
          <br />
          {transactions.map((tx) => (
            <div
              key={tx.txId}
              style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #333' }}
            >
              <div>
                <strong>Transaction ID:</strong>
                <div style={{ wordBreak: 'break-all' }}>{tx.txId}</div>
              </div>
              <div>
                <strong>Created At:</strong> {tx.createdAt}
              </div>
              <div>
                <strong>LP Identity Public Key:</strong>
                <div style={{ wordBreak: 'break-all' }}>{tx.lpIdentityPublicKey}</div>
              </div>
            </div>
          ))}
        </>
      )}
      {transactions && transactions.length === 0 && (
        <div>No eligible clawback transactions found.</div>
      )}
      <Button onClick={onClick}>Call spark_flashnet_getClawbackEligibleTransfers</Button>
    </Card>
  );
};
