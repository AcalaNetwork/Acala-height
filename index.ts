import Router from 'koa-router';
import { calcTime } from './blockTime'
import { calcApr } from './apr';
import ioredis, { Redis } from 'ioredis';
import Koa from 'koa';
import mongo from 'mongoose';
import { scheduledTask } from './pulse-data/task';
import { pulseQuery } from './pulse-data';

export let redis: Redis;

const app = new Koa();
const router = new Router();

router.get('/apr', calcApr);
router.get('/pulse', pulseQuery);
router.get('/', calcTime);
app.use(router.routes()).use(router.allowedMethods());

scheduledTask();

app.listen(1020, () => {
  const redisClient = new ioredis({ host: 'redis' });
  // const redisClient = new ioredis({port: 6379});
  redisClient.on('connect', () => {
    redis = redisClient;
    console.log(`Redis Connect Success!`);
  })

  mongo.connect(`mongodb://mongo:27017/pulse`).then(() => {
    // mongo.connect(`mongodb://localhost:27017/pulse`).then(() => {
    console.log(`Mongo Connect Success!`);
  });
  console.log('Server [karura-height] start at: ', 1020);
});