import { useCallback, useState } from 'react';
import { request, SparkGetBalanceResult } from 'sats-connect';
import { Button, Card } from '../../../App.styles';
import { useGlobalState } from '../../GlobalStateProvider/use-global-state';

export const SparkGetBalance = () => {
  const { sparkAddressInfo } = useGlobalState();
  const [balance, setBalance] = useState<SparkGetBalanceResult>();

  const onClick = useCallback(() => {
    (async () => {
      const response = await request('spark_getBalance', null);

      if (response.status === 'error') {
        console.error(response.error);
        alert('Error retrieving Spark Balance. See console for details.');
        return;
      }

      console.log(response.result);
      setBalance(response.result);
    })().catch(console.error);
  }, []);

  if (sparkAddressInfo.length === 0) {
    return <div>Please connect your Spark wallet to use this feature.</div>;
  }

  return (
    <Card>
      <h3>Get Balance</h3>
      {balance && (
        <>
          <div>
            <div>Bitcoin Balance</div>
            <div>{balance.balance}</div>
          </div>
          <br />
          <div>
            <div>Tokens</div>
            <div>
              {balance.tokenBalances.map((token) => (
                <div key={token.tokenMetadata.tokenIdentifier}>
                  <div>{token.tokenMetadata.tokenName}</div>
                  Balance: {token.balance}
                  <br />
                  Token Identifier: {token.tokenMetadata.tokenIdentifier}
                  <br />
                  Decimals: {token.tokenMetadata.decimals}
                  <br />
                  <br />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <Button onClick={onClick}>Call spark_getBalance</Button>
    </Card>
  );
};
