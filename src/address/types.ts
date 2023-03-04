import { BitcoinNetwork, Purpose } from '../provider/bitcoin.provider';

interface GetAddressPayload {
  purpose: Purpose;
  message: string;
  network: BitcoinNetwork;
}

export interface GetAddressResponse {
  address: string;
  network: string;
}

export interface GetAddressOptions {
  onFinish: (response: GetAddressResponse) => void;
  onCancel: () => void;
  payload: GetAddressPayload;
}
