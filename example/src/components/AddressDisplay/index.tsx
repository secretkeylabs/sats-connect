import { Address, BitcoinNetworkType } from 'sats-connect';
import { Button, Card, H4 } from '../../App.styles';

interface Props {
  accountId: string;
  network: BitcoinNetworkType;
  addresses: Address[];
  onDisconnect: () => void;
}

export const AddressDisplay = ({ accountId, network, addresses, onDisconnect }: Props) => {
  return (
    <Card>
      <h3>Connected Addresses - ({network})</h3>
      <div>
        <H4>Account: {accountId}</H4>
      </div>
      {addresses.map((address) => (
        <div key={address.purpose}>
          <H4>{address.purpose}</H4>
          <div>Address: {address.address}</div>
          <div>Public key: {address.publicKey}</div>
        </div>
      ))}
      <div>
        <Button onClick={onDisconnect}>Disconnect</Button>
      </div>
    </Card>
  );
};

export default AddressDisplay;
