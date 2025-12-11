import { deserializeTransaction } from '@stacks/transactions';

export const verifySigHash = ({ txHex }: { txHex: string }) => {
  try {
    const tx = deserializeTransaction(txHex);
    tx.verifyOrigin();
    console.log('Signature verified');
  } catch (error) {
    console.log(error);
    if (String(error).toLowerCase().includes('invalid signature')) {
      console.error('Invalid signature');
    } else if (
      String(error).toLowerCase().includes('signer hash does not equal hash of public key')
    ) {
      console.error('Sign with connected wallet');
    } else {
      console.error('Error verifying signature');
    }
  }
};
