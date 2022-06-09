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

export const queryBlock = (network: string, monthsago: string) => {
  const url = network === 'karura' ? 'https://api.subquery.network/sq/AcalaNetwork/karura' : 'https://api.subquery.network/sq/AcalaNetwork/acala__QWNhb';

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

const monthAgoTimes = (network: string) => {
  let interval_days = 0;
  if (network === 'karura') {
    interval_days = 90
  } else {
    interval_days = 30
  }

  return {
    timeStr: dayjs().subtract(interval_days, 'day').format('YYYY-MM-DDTHH:mm:ss'),
    days: interval_days
  }
}

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

  const { timeStr, days } = monthAgoTimes(_network);

  const blockData = await queryBlock(_network, timeStr);
  const height = blockData.blocks.nodes[0].parentHash;

  if (_network === 'acala' && Number(blockData.blocks.nodes[0].number) <= 960000) {
    return ctx.body = 0.1450;
  }

  const monthsagoApi = await api.at(height);

  const _totalStaking = await getTotalStaking(monthsagoApi as any);
  const _totalLiquidity = await getTotalLiquidity(monthsagoApi as any, _network === 'karura' ? 'LKSM' : 'LDOT');

  const current = FixedPointNumber.fromRational(totalStaking, totalLiquidity);
  const monthsago = FixedPointNumber.fromRational(_totalStaking, _totalLiquidity);

  const apr = Math.pow(current.div(monthsago).toNumber(), 365 / days) -1

  if (!Number.isNaN(apr) || apr === 0) {
    await redis.set(`apr:${_network}`, apr, 'EX', 60 * 60 * 24 * 3);
  }

  return ctx.body = apr;
}