import { Space } from '@mantine/core';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Wallet, { AddressPurpose } from 'sats-connect';
import { Button, ConnectButtonsContainer, Container, Header, Logo } from '../../App.styles';
import { useGlobalState } from '../GlobalStateProvider/use-global-state';
import { NetworkSelector } from '../NetworkSelector';

export function Connect() {
  const navigate = useNavigate();
  const {
    isConnected,
    disconnect,
    setBtcAddressInfo,
    setStxAddressInfo,
    setSparkAddressInfo,
    setStarknetAddressInfo,
    setAccountId,
  } = useGlobalState();

  const handleConnect = useCallback(() => {
    (async () => {
      const res = await Wallet.request('wallet_connect', {
        message: 'Cool app wants to know your addresses!',
        addresses: [
          AddressPurpose.Payment,
          AddressPurpose.Ordinals,
          AddressPurpose.Stacks,
          AddressPurpose.Spark,
          AddressPurpose.Starknet,
        ],
      });

      if (res.status === 'error') {
        console.error('Error connecting to wallet, details in terminal.');
        console.error(res);
        return;
      }
      console.log('Connected', res);
      const btcAddresses = res.result.addresses.filter((a) =>
        [AddressPurpose.Ordinals, AddressPurpose.Payment].includes(a.purpose),
      );
      setBtcAddressInfo(btcAddresses);
      setStxAddressInfo(res.result.addresses.filter((a) => a.purpose === AddressPurpose.Stacks));
      setSparkAddressInfo(res.result.addresses.filter((a) => a.purpose === AddressPurpose.Spark));
      setStarknetAddressInfo(
        res.result.addresses.filter((a) => a.purpose === AddressPurpose.Starknet),
      );
      setAccountId(res.result.id);

      navigate('/wallet');
    })().catch(console.error);
  }, [
    setBtcAddressInfo,
    setStxAddressInfo,
    setSparkAddressInfo,
    setStarknetAddressInfo,
    setAccountId,
    navigate,
  ]);

  const handleLegacyConnectWithRequestPermissions = useCallback(() => {
    (async () => {
      const res = await Wallet.request('wallet_requestPermissions', undefined);
      if (res.status === 'error') {
        console.error('Error connecting to wallet, details in terminal.');
        console.error(res);
        return;
      }

      const res2 = await Wallet.request('getAddresses', {
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
      });
      if (res2.status === 'error') {
        console.error(res2);
        console.error('Error retrieving bitcoin addresses after having requested permissions.');
        return;
      }
      setBtcAddressInfo(res2.result.addresses);

      const res3 = await Wallet.request('stx_getAddresses', null);
      if (res3.status === 'error') {
        console.error(res3);
        alert(
          'Error retrieving stacks addresses after having requested permissions. Details in terminal.',
        );
        return;
      }
      setStxAddressInfo(res3.result.addresses);

      const res4 = await Wallet.request('spark_getAddresses', null);
      if (res4.status === 'error') {
        console.error(res4);
        alert(
          'Error retrieving spark addresses after having requested permissions. Details in terminal.',
        );
        return;
      }
      setSparkAddressInfo(res4.result.addresses);

      navigate('/wallet');
    })().catch(console.error);
  }, [navigate, setBtcAddressInfo, setSparkAddressInfo, setStxAddressInfo]);

  const handleLegacyConnectWithGetAccounts = useCallback(() => {
    (async () => {
      const response = await Wallet.request('getAccounts', {
        purposes: [
          AddressPurpose.Payment,
          AddressPurpose.Ordinals,
          AddressPurpose.Stacks,
          AddressPurpose.Spark,
          AddressPurpose.Starknet,
        ],
        message: 'Cool app wants to know your addresses!',
      });
      if (response.status === 'success') {
        setBtcAddressInfo(
          response.result.filter(
            (a) => a.purpose === AddressPurpose.Payment || a.purpose === AddressPurpose.Ordinals,
          ),
        );
        setStxAddressInfo(response.result.filter((a) => a.purpose === AddressPurpose.Stacks));
        setSparkAddressInfo(response.result.filter((a) => a.purpose === AddressPurpose.Spark));
        setStarknetAddressInfo(
          response.result.filter((a) => a.purpose === AddressPurpose.Starknet),
        );
      }

      navigate('/wallet');
    })().catch(console.error);
  }, [navigate, setBtcAddressInfo, setSparkAddressInfo, setStarknetAddressInfo, setStxAddressInfo]);

  return (
    <Container>
      <Header>
        <Logo src="/sats-connect.svg" alt="SatsConnect" />
        <NetworkSelector />
        <p>Click the button to connect your wallet</p>
        <ConnectButtonsContainer>
          <Button onClick={handleConnect}>Connect</Button>
          <Button onClick={handleLegacyConnectWithRequestPermissions}>
            wallet_requestPermissions
          </Button>
          <Button onClick={handleLegacyConnectWithGetAccounts}>Connect (Legacy getAccounts)</Button>
        </ConnectButtonsContainer>

        {isConnected && (
          <>
            <Space h="xl" />
            <Button onClick={disconnect}>Disconnect</Button>
          </>
        )}
      </Header>
    </Container>
  );
}
