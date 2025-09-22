import { useCallback, useState } from 'react';
import { request } from 'sats-connect';
import { Button, Card } from '../../../App.styles';
import { useGlobalState } from '../../GlobalStateProvider/use-global-state';

export const GetFlashnetJwt = () => {
  const { sparkAddressInfo } = useGlobalState();
  const [jwt, setJwt] = useState<string>('');

  const onClick = useCallback(() => {
    (async () => {
      const response = await request('spark_flashnet_getJwt', {
        message: 'Please confirm to send the JWT to the awesome dApp.',
      });

      if (response.status === 'error') {
        console.error(response.error);
        alert('Error retrieving Flashnet JWT. See console for details.');
        return;
      }

      console.log(response.result);
      setJwt(response.result.jwt);
    })().catch(console.error);
  }, []);

  if (sparkAddressInfo.length === 0) {
    return <div>Please connect your Spark wallet to use this feature.</div>;
  }

  return (
    <Card>
      <h3>Get Flashnet JWT</h3>
      <Button onClick={onClick}>Call spark_flashnet_getJwt</Button>
      {jwt && (
        <div>
          <div>JWT</div>
          <div>{jwt}</div>
        </div>
      )}
    </Card>
  );
};
