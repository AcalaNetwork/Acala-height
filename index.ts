import Koa from 'koa';
import Router from 'koa-router';
import { calcTime } from './blockTime'
import { calcApr } from './apr';

export const app = new Koa();
const router = new Router();

router.get('/apr', calcApr);
router.get('/', calcTime);

app.use(router.routes()).use(router.allowedMethods())

app.listen(1020,() => {
  console.log('Server [karura-height] start at: ', 1020);
});