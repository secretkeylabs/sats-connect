import { getAddress } from './addresses';
import { getCapabilities } from './capabilities';
import { createInscription, createRepeatInscriptions } from './inscriptions';
import { signMessage } from './messages';
import { sendBtcTransaction, signMultipleTransactions, signTransaction } from './transactions';

(window as any).SatsConnect = {
  getAddress,
  getCapabilities,
  createInscription,
  createRepeatInscriptions,
  signMessage,
  sendBtcTransaction,
  signMultipleTransactions,
  signTransaction,
};
