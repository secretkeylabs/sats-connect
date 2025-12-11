import { Stack, TextInput } from '@mantine/core';
import {
  Pc,
  PostCondition,
  cvToHex,
  noneCV,
  postConditionToHex,
  standardPrincipalCV,
  uintCV,
} from '@stacks/transactions';
import { ChangeEventHandler, useState } from 'react';
import { Address, BitcoinNetworkType, request, type StxCallContractParams } from 'sats-connect';
import { Success } from '../../../App.styles';
import { MethodLayout } from '../../../layouts/MethodLayout';

const formInitialState = {
  amount: '100000000', // 100LEO
  contract: 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token', // LEO token contract
  address: 'SP313FW47A0XR7HCBFQ0ZZHS47Q265AEBMPK1GD4N', // account 2
  memo: '',
};

const formInputs: {
  field: keyof typeof formInitialState;
  label: string;
  type: 'text' | 'number';
}[] = [
  {
    field: 'contract',
    label: 'Contract',
    type: 'text',
  },
  {
    field: 'amount',
    label: 'Amount',
    type: 'number',
  },
  {
    field: 'address',
    label: 'Address',
    type: 'text',
  },
  {
    field: 'memo',
    label: 'Memo (optional)',
    type: 'text',
  },
];

export const SendSip10 = ({
  network,
  stxAddressInfo,
}: {
  network: BitcoinNetworkType;
  stxAddressInfo: Address[];
}) => {
  const [form, setForm] = useState(formInitialState);
  const [txnId, setTxnId] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [options, setOptions] = useState<StxCallContractParams | null>(null);

  const getChangeFormHandler =
    (fieldName: keyof typeof formInitialState): ChangeEventHandler<HTMLInputElement> =>
    (e) => {
      setForm((prevForm) => ({ ...prevForm, [fieldName]: e.target.value }));
    };

  interface PostConditionsOptions {
    contractAddress: string;
    contractName: string;
    assetName: string;
    stxAddress: string;
    amount: string | number;
  }

  const makeFungiblePostCondition = (options: PostConditionsOptions): PostCondition => {
    const { contractAddress, contractName, assetName, stxAddress, amount } = options;

    return Pc.principal(stxAddress)
      .willSendEq(amount)
      .ft(`${contractAddress}.${contractName}`, assetName);
  };

  const handleSendSip10 = () => {
    const handler = async () => {
      const postConditions = [
        makeFungiblePostCondition({
          contractAddress: form.contract.split('.')[0],
          contractName: form.contract.split('.')[1],
          assetName: 'leo',
          stxAddress: stxAddressInfo?.[0].address,
          amount: form.amount,
        }),
      ];

      const params: StxCallContractParams = {
        contract: form.contract,
        functionName: 'transfer',
        functionArgs: [
          uintCV(Number(form.amount)),
          standardPrincipalCV(stxAddressInfo?.[0].address),
          standardPrincipalCV(form.address),
          noneCV(),
        ].map((arg) => cvToHex(arg)),
        postConditionMode: 'deny',
        postConditions: postConditions.map((pc) => postConditionToHex(pc)),
      };
      setOptions(params);

      const res = await request('stx_callContract', params);
      setResponse(JSON.stringify(res, null, 2));
      console.log('request("stx_callContract", options)');
      console.log('options:\n', params);
      console.log('response:\n', res);

      if (res.status === 'error') {
        console.error(res.error);
        return;
      }

      setTxnId(res.result.txid);
    };
    handler().catch(console.error);
  };

  const explorerUrl =
    network === BitcoinNetworkType.Mainnet
      ? `https://explorer.hiro.so/txid/${txnId}`
      : `https://explorer.hiro.so/txid/${txnId}?chain=testnet`;

  return (
    <MethodLayout<StxCallContractParams>
      method="stx_callContract"
      docsUrl="https://docs.xverse.app/sats-connect/stacks-methods/stx_callcontract"
      options={options}
      handleRequest={handleSendSip10}
      response={response}
    >
      <Stack>
        {formInputs.map(({ field, label, type }) => (
          <TextInput
            key={field}
            label={label}
            type={type}
            value={form[field]}
            onChange={getChangeFormHandler(field)}
          />
        ))}
        {txnId && (
          <Success>
            Success! Click{' '}
            <a href={explorerUrl} target="_blank" rel="noreferrer">
              here
            </a>{' '}
            to see your transaction
          </Success>
        )}
      </Stack>
    </MethodLayout>
  );
};
