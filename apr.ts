import { Context } from "koa";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { FixedPointNumber } from "@acala-network/sdk-core";
import { gql, request } from 'graphql-request';
import dayjs from "dayjs";
import { redis } from ".";

const liquidTokenDecimals = 12;
const stakeTokenDecimals = 12;

const getTotalStaking = async (api: ApiPromise) => {
  const toBond = await api.query.homa.toBondPool();
  const stakingLedgers = await api.query.homa.stakingLedgers.entries();
  let totalInSubAccount = FixedPointNumber.ZERO;

  stakingLedgers.map(item => {
    const ledge = (item[1] as any).unwrapOrDefault();
    totalInSubAccount = totalInSubAccount.add(FixedPointNumber.fromInner(ledge.bonded.unwrap().toString(), stakeTokenDecimals));
  })

  return FixedPointNumber.fromInner(toBond.toString(), stakeTokenDecimals).add(totalInSubAccount);

}

const getTotalLiquidity = async (api: ApiPromise) => {

  const issuance = await api.query.tokens.totalIssuance({ Token: 'LKSM' });
  const voidLiquid = await api.query.homa.totalVoidLiquid();
  return FixedPointNumber.fromInner(issuance.toString(), liquidTokenDecimals).add(FixedPointNumber.fromInner(voidLiquid.toString(), liquidTokenDecimals));
}

export const queryBlock = () => {
  const url = 'https://api.subquery.network/sq/AcalaNetwork/karura';
  const monthof3age = dayjs().subtract(3, 'month').format('YYYY-MM-DDTHH:mm:ss');

  return request(url, gql`
    query {
      blocks (filter: {timestamp: {greaterThan: "${monthof3age}"}}, orderBy: TIMESTAMP_ASC, first: 1) {
        nodes {
          id
          timestamp
          number
        }
      }
    }
  `);
};

export const calcApr = async (ctx: Context) => {
  const redisdata = await redis.get('apr');
  if (redisdata) {
    return ctx.body = redisdata;
  }
  const wsProvider = new WsProvider('wss://karura.polkawallet.io/');
  const api = new ApiPromise({ provider: wsProvider });
  await api.isReady.then(() => console.log('api is ready'));
  const totalStaking = await getTotalStaking(api);
  const totalLiquidity = await getTotalLiquidity(api);

  const blockData = await queryBlock();
  const height = blockData.blocks.nodes[0].id;

  const monthof3ageApi = await api.at(height);

  const _totalStaking = await getTotalStaking(monthof3ageApi as any);
  const _totalLiquidity = await getTotalLiquidity(monthof3ageApi as any);

  const current = FixedPointNumber.fromRational(totalStaking, totalLiquidity);
  const month3age = FixedPointNumber.fromRational(_totalStaking, _totalLiquidity);

  const apr = current.minus(month3age).div(month3age).times(FixedPointNumber.FOUR).toNumber();

  await redis.set('apr', apr, 'EX', 60 * 60 * 24 * 3);

  return ctx.body = apr;
}