import { forceToCurrencyName, Token } from '@acala-network/sdk-core';
import { gql, request } from 'graphql-request';

export async function getHolder(token: Token | string, NETWORK: string) {
  const tokenName = forceToCurrencyName(token);
  const GRAPHQL_TOKENS_REQUEST_URI = process.env.TOKENS_GRAPHQL || (NETWORK === 'ACALA' ? 'https://api.subquery.network/sq/AcalaNetwork/acala-tokens-ipfs' : 'https://api.subquery.network/sq/AcalaNetwork/karura-tokens-ipfs');

  const result = await request(GRAPHQL_TOKENS_REQUEST_URI || '', gql`
    query {
      accountBalances (filter:{tokenId:{equalTo:"${tokenName}"}}) {
          totalCount
      }
    }
  `);

  return parseInt(result?.accountBalances?.totalCount || '0');
}