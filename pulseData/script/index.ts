import { ApiPromise, WsProvider } from '@polkadot/api';
import { _task } from '../task';

export const runScripts = () => {
  const isRun = process.env.isRun;

  if (isRun) {
    console.log('Do running script!!!!')
    queryKaruraChainData();
  } else {
    console.log('Not running script!!!!')
  }
}

const queryKaruraChainData = async () => {
  const karuraStart = 2215470;
  const karuraStep = 1990;
  const acalaStart = 1365270;
  const acalaStep = 2270;

  const karuraWsProvider = new WsProvider('wss://karura.api.onfinality.io/public-ws');
  const karuraInstance = await ApiPromise.create({ provider: karuraWsProvider });
  await karuraInstance.isReady;

  const acalaWsProvider = new WsProvider('wss://acala-rpc-0.aca-api.network/');
  const acalaInstance = await ApiPromise.create({ provider: acalaWsProvider });
  await acalaInstance.isReady;

  for (let i = 0; i < 120; i++) {
    const karuraHeight = karuraStart - karuraStep * i;
    const acalaHeight = acalaStart - acalaStep * i;
    const karuraHash = await karuraInstance.rpc.chain.getBlockHash(karuraHeight);
    const acalaHash = await karuraInstance.rpc.chain.getBlockHash(acalaHeight);
    const karuraApi = await karuraInstance.at(karuraHash);
    const acalaApi = await acalaInstance.at(acalaHash);
    console.log(i + 1, 'start');
    await _task(karuraApi, acalaApi)
  }
}