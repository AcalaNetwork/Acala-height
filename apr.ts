import { Context } from "koa";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { FixedPointNumber } from "@acala-network/sdk-core";
import { gql, request } from 'graphql-request';
import dayjs from "dayjs";

const liquidTokenDecimals = 12;
const stakeTokenDecimals = 12;

const getTotalStaking = async (api: ApiPromise) => {
  // now
  // toBond: 21233001944
  // legers: 80679280425263358   6840946719082802   6081837485254305
  // == 93602085862602409
  // 3 month age
  // toBond: 31260778454928
  // legers: 63904749115040723
  // == 63936009893495651
  const toBond = await api.query.homa.toBondPool();
  const stakingLedgers = await api.query.homa.stakingLedgers.entries();
  let totalInSubAccount = FixedPointNumber.ZERO;

  stakingLedgers.map(item => {
    const ledge = (item[1] as any).unwrapOrDefault();
    totalInSubAccount = totalInSubAccount.add(FixedPointNumber.fromInner(ledge.bonded.unwrap().toString(), stakeTokenDecimals));
  })

  return FixedPointNumber.fromInner(toBond.toString(), stakeTokenDecimals).add(totalInSubAccount);

}

// hash : 0xa78792e33353add048738c97d3a541f8d45eef5e077b12076c153a393dcf994a

const getTotalLiquidity = async (api: ApiPromise) => {
  // now
  // issuance: 819202616804335856
  // voidLiquid: 9145469841
  //  == 819202625949805697
  // 3 month age
  // issuance: 585562486938164463
  // voidLiquid: 31489984337
  //  == 585562518428148800

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

  console.log(totalStaking.toString())
  console.log(totalLiquidity.toString())

  console.log(_totalStaking.toString())
  console.log(_totalLiquidity.toString())

  ctx.body = {
    exchangeRateCurrent: current.toNumber(),
    exchangeRate3monthAge: month3age.toNumber(),
    apr: current.minus(month3age).div(month3age).times(FixedPointNumber.FOUR).toNumber()
  };
}