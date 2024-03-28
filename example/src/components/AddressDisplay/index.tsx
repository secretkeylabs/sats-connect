import { Address, BitcoinNetworkType } from 'sats-connect';

type Props = {
  network: BitcoinNetworkType;
  addresses: Address[];
  onDisconnect: () => void;
};

const AddressDisplay = ({ network, addresses, onDisconnect }: Props) => {
  return (
    <div className="card">
      <h3>Connected Addresses - ({network})</h3>
      {addresses.map((address) => (
        <div key={address.purpose}>
          <h4>{address.purpose}</h4>
          <div>Address: {address.address}</div>
          <div>Public key: {address.publicKey}</div>
        </div>
      ))}
      <div>
        <button onClick={onDisconnect}>Disconnect</button>
      </div>
    </div>
  );
};

export default AddressDisplay;
