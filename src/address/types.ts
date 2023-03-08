import { BitcoinNetwork, Purpose } from '../provider';

export interface GetAddressPayload {
  purposes: Array<Purpose>;
  message: string;
  network: BitcoinNetwork;
}

export interface Address {
  address: string;
  publicKey: string;
  purpose: Purpose;
}

export interface GetAddressResponse {
  addresses: Array<Address>
}

export interface GetAddressOptions {
  onFinish: (response: GetAddressResponse) => void;
  onCancel: () => void;
  payload: GetAddressPayload;
}
