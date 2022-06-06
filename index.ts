import Router from 'koa-router';
import { calcTime } from './blockTime'
import { calcApr } from './apr';
import ioredis, { Redis } from 'ioredis';
import Koa from 'koa';

export let redis: Redis;

const app = new Koa();
const router = new Router();

router.get('/apr', calcApr);
router.get('/', calcTime);
app.use(router.routes()).use(router.allowedMethods());

app.listen(1020, () => {
  // const redisClient = new ioredis({host: 'redis'});
  // const redisClient = new ioredis(process.env.REDIS_URL);
  const redisClient = new ioredis({port: 6379});
  redisClient.on('connect', () => {
    redis = redisClient;
    console.log(`Redis Connect Success!`);
  })
  console.log('Server [karura-height] start at: ', 1020);
});