import { BitcoinNetwork, Purpose } from '../provider';

export interface GetAddressPayload {
  purpose: Purpose;
  message: string;
  network: BitcoinNetwork;
}

export interface GetAddressResponse {
  address: string;
  purpose: Purpose;
}

export interface GetAddressOptions {
  onFinish: (response: GetAddressResponse) => void;
  onCancel: () => void;
  payload: GetAddressPayload;
}
