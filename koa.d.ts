import { ApiPromise } from '@polkadot/api';
import Application from 'koa';

declare module 'koa' {
  interface IContext extends Application.DefaultContext  {
    api: ApiPromise
    c: number
  }

  interface IState extends Application.DefaultState  {
    api: ApiPromise
    c: number
  }
}