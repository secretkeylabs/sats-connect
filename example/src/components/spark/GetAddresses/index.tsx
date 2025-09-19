import { request, SparkGetAddressesResult } from '@sats-connect/core';
import { useCallback, useState } from 'react';
import { Button, Card } from '../../../App.styles';

export const SparkGetAddresses = () => {
  const [addresses, setAddresses] = useState<SparkGetAddressesResult>();

  const onClick = useCallback(() => {
    (async () => {
      const response = await request('spark_getAddresses', null);

      if (response.status === 'error') {
        console.error(response.error);
        alert('Error retrieving Spark Addresses. See console for details.');
        return;
      }

      console.log(response);
      setAddresses(response.result);
    })().catch(console.error);
  }, []);

  return (
    <Card>
      <h3>Get Addresses</h3>
      {addresses?.addresses.map((a, i) => (
        <div key={a.address}>
          <div>Address {i + 1}</div>
          <div>{a.address}</div>
          <div>Public Key</div>
          <div>{a.publicKey}</div>
        </div>
      ))}
      <Button onClick={onClick}>Call spark_getAddresses</Button>
    </Card>
  );
};
