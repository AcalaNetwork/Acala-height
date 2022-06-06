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

const getTotalLiquidity = async (api: ApiPromise, token: string) => {
  const issuance = await api.query.tokens.totalIssuance({ Token: token });
  const voidLiquid = await api.query.homa.totalVoidLiquid();
  return FixedPointNumber.fromInner(issuance.toString(), liquidTokenDecimals).add(FixedPointNumber.fromInner(voidLiquid.toString(), liquidTokenDecimals));
}

export const queryBlock = (network: string) => {
  const url = network === 'karura' ?  'https://api.subquery.network/sq/AcalaNetwork/karura' : 'https://api.subquery.network/sq/AcalaNetwork/acala__QWNhb';
  const monthsago = dayjs().subtract(network === 'karura' ? 3 : 1, 'month').format('YYYY-MM-DDTHH:mm:ss');

  return request(url, gql`
    query {
      blocks (filter: {timestamp: {greaterThan: "${monthsago}"}}, orderBy: TIMESTAMP_ASC, first: 1) {
        nodes {
          id
          timestamp
          number
          parentHash
        }
      }
    }
  `);
};

export const calcApr = async (ctx: Context) => {
  const network = ctx.request.query.network;
  const _network = (network || 'karura') as string;
  const redisdata = await redis.get(`apr:${_network}`);
  if (redisdata) {
    return ctx.body = redisdata;
  }
  const wsProvider = new WsProvider(_network === 'karura' ? 'wss://karura.polkawallet.io/' : 'wss://acala.polkawallet.io/');
  const api = new ApiPromise({ provider: wsProvider });
  await api.isReady.then(() => console.log('api is ready'));
  const totalStaking = await getTotalStaking(api);
  const totalLiquidity = await getTotalLiquidity(api, _network === 'karura' ? 'LKSM' : 'LDOT');

  console.log(totalStaking.toString())
  console.log(totalLiquidity.toString())

  const blockData = await queryBlock(_network);
  const height = blockData.blocks.nodes[0].parentHash;

  const monthsagoApi = await api.at(height);

  const _totalStaking = await getTotalStaking(monthsagoApi as any);
  const _totalLiquidity = await getTotalLiquidity(monthsagoApi as any, _network === 'karura' ? 'LKSM' : 'LDOT');

  console.log(_totalStaking.toString())
  console.log(_totalLiquidity.toString())

  const current = FixedPointNumber.fromRational(totalStaking, totalLiquidity);
  const monthsago = FixedPointNumber.fromRational(_totalStaking, _totalLiquidity);

  const apr = current.minus(monthsago).div(monthsago).times(_network === 'karura' ?  FixedPointNumber.FOUR : new FixedPointNumber(12));

  if(!apr.isNaN() && !apr.isZero()) {
    await redis.set(`apr:${_network}`, apr.toNumber(), 'EX', 60 * 60 * 24 * 3);
  }

  return ctx.body = apr.toNumber();
}