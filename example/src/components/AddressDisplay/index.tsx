import { Address, BitcoinNetworkType } from 'sats-connect';
import { Button, Card, H4 } from '../../App.styles';

interface Props {
  accountId: string | null;
  network: BitcoinNetworkType;
  addresses: Address[];
  onDisconnect: () => void;
}

const formatUnlockDefinition = (address: Address): string =>
  address.unlockDefinition ? JSON.stringify(address.unlockDefinition, null, 2) : '-';

export const AddressDisplay = ({ accountId, network, addresses, onDisconnect }: Props) => {
  return (
    <Card>
      <h3>Connected Addresses - ({network})</h3>
      <div>
        <H4>Account: {accountId ?? '-'}</H4>
      </div>
      {addresses.map((address) => (
        <div key={address.address}>
          <H4>{address.purpose}</H4>
          <div>Address: {address.address}</div>
          <div>Public key: {address.publicKey || '-'}</div>
          <div>Address type: {address.addressType ?? '-'}</div>
          <div>Wallet type: {address.walletType ?? '-'}</div>
          <div style={{ overflowWrap: 'anywhere' }}>
            Script pubkey: {address.scriptPubKey ?? '-'}
          </div>
          <div>Unlock definition:</div>
          <pre style={{ marginTop: 0, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
            {formatUnlockDefinition(address)}
          </pre>
        </div>
      ))}
      <div>
        <Button onClick={onDisconnect}>Disconnect</Button>
      </div>
    </Card>
  );
};

export default AddressDisplay;
