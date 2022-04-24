import { gql, request } from 'graphql-request';
import Koa from 'koa';

const app = new Koa();

const karuraSubql = 'https://api.subquery.network/sq/AcalaNetwork/karura';
const acalaSubql = 'https://api.subquery.network/sq/AcalaNetwork/acala';

export const queryBlock = (network: string, height: number) => {
  const url = network == 'KARURA' ? karuraSubql : acalaSubql;

  return request(url, gql`
    query {
      blocks(filter: {number: {equalTo: "${height}"}}) {
        nodes {
          id
          timestamp
          number
        }
      }
    }
  `);
};

export const queryLastestBlock = (network: string) => {
  const url = network == 'KARURA' ? karuraSubql : acalaSubql;

  return request(url, gql`
    query {
      blocks(orderBy: NUMBER_DESC, first:1)  {
        nodes {
          id
          timestamp
          number
        }
      }
    }
  `);
};

app.use(async ctx => {
  const { network = 'Karura', recent, from, to } = ctx.request.query;

  let highHeight = 0;
  let lowHeight = 0;
  let highTime = 0;
  let lowTime = 0;
  let gap = 0;
  let data: any = {};

  if (from && from != '0' && to && to != '0') {
    highHeight = Number(from) > Number(to) ? Number(from) : Number(to);
    lowHeight = Number(from) < Number(to) ? Number(from) : Number(to);

    const high = await queryBlock((network as string).toUpperCase(), highHeight);
    highTime = new Date(high.blocks.nodes[0].timestamp).getTime();
    const low = await queryBlock((network as string).toUpperCase(), lowHeight);
    lowTime = new Date(low.blocks.nodes[0].timestamp).getTime();
    gap = highHeight - lowHeight;
    data.from = from;
    data.to = to;
    data.gap = gap
  } else {
    const _recent = recent ? Number(recent) : 500;
    const high = await queryLastestBlock((network as string).toUpperCase());
    highHeight = Number(high.blocks.nodes[0].number);
    highTime = new Date(high.blocks.nodes[0].timestamp).getTime();
    const low = await queryBlock((network as string).toUpperCase(), highHeight - _recent);
    lowHeight = Number(low.blocks.nodes[0].number);
    lowTime = new Date(low.blocks.nodes[0].timestamp).getTime();
    gap = _recent;
    data.recent = Number(recent);
    data.gap = gap
  }

  return ctx.body = {
    avg: ((highTime - lowTime) / gap) / 1000,
    data
  }
})

app.listen(1020, async () => {
  console.log('Server [karura-height] start at: ', 1020);

});