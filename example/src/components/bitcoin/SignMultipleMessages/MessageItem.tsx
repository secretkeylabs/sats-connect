import { Button, Input, NativeSelect } from '@mantine/core';
import { Address, MessageSigningProtocols } from 'sats-connect';

interface Props {
  address: string;
  setAddress: (address: string) => void;
  addresses: Address[];
  message: string;
  setMessage: (message: string) => void;
  protocol: MessageSigningProtocols;
  setProtocol: (protocol: MessageSigningProtocols) => void;
  onDelete: () => void;
}

export const MessageItem = ({
  address,
  setAddress,
  addresses,
  message,
  setMessage,
  protocol,
  setProtocol,
  onDelete,
}: Props) => {
  return (
    <>
      <div>
        <div>Message</div>
        <Input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <div style={{ marginTop: 15 }}>
        <div>Address</div>
        <NativeSelect defaultValue={address} onChange={(e) => setAddress(e.target.value)}>
          <option value={addresses[0]?.address}>{addresses[0]?.address}</option>
          <option value={addresses[1]?.address}>{addresses[1]?.address}</option>
        </NativeSelect>
      </div>
      <div style={{ marginTop: 15 }}>
        <div>Protocol</div>
        <NativeSelect
          defaultValue={protocol}
          onChange={(e) => setProtocol(e.target.value as MessageSigningProtocols)}
        >
          <option value={MessageSigningProtocols.ECDSA}>{MessageSigningProtocols.ECDSA}</option>
          <option value={MessageSigningProtocols.BIP322}>{MessageSigningProtocols.BIP322}</option>
        </NativeSelect>
      </div>
      <Button color="red" onClick={onDelete}>
        Delete Message
      </Button>
    </>
  );
};
