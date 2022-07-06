import { Wallet } from '@acala-network/sdk';
import { ApiPromise, WsProvider } from '@polkadot/api';
import dayjs from 'dayjs';
import { getHolder } from '../func/getHolder';
import { lcdotTvl } from '../func/lcdotTvl';
import { liquidityPoolTvl } from '../func/liquidityPoolTvl';
import { lpTokenStakingTvl } from '../func/lpTokenStakingTvl';
import { stableCoin } from '../func/stablecoin';
import { stakingTokenBridgeTvl } from '../func/stakingTokenBridgeTvl';
import { totalLiquidTokenTvl } from '../func/totalLiquidTokenTvl';
import { pulseModal } from '../db/modal';
import { _task } from '../task';

export const runScripts = () => {
  // queryKaruraChainData();
}

const queryKaruraChainData = async () => {
  const karuraStart = 2215470;
  const karuraStep = 1990;
  const acalaStart = 1365270;
  const acalaStep = 2270;

  const karuraWsProvider = new WsProvider('wss://karura.api.onfinality.io/public-ws');
  const karuraInstance = await ApiPromise.create({ provider: karuraWsProvider });
  await karuraInstance.isReady;
  const karuraWallet = new Wallet(karuraInstance, {
    supportAUSD: true,
  });
  await karuraWallet.isReady;

  const acalaWsProvider = new WsProvider('wss://acala-rpc-0.aca-api.network/');
  const acalaInstance = await ApiPromise.create({ provider: acalaWsProvider });
  await acalaInstance.isReady;
  const acalaWallet = new Wallet(acalaInstance, {
    supportAUSD: true,
  });
  await acalaWallet.isReady;

  for (let i = 0; i < 120; i++) {
    const karuraHeight = karuraStart - karuraStep * i;
    const acalaHeight = acalaStart - acalaStep * i;
    const karuraHash = await karuraInstance.rpc.chain.getBlockHash(karuraHeight);
    const acalaHash = await acalaInstance.rpc.chain.getBlockHash(acalaHeight);
    const karuraApi = await karuraInstance.at(karuraHash) as any;
    const acalaApi = await acalaInstance.at(acalaHash) as any;
    const chianDate = await karuraApi.query.timestamp.now();
    console.log(i + 1, 'start');

    const date = dayjs(Number(chianDate.toString())).startOf('hour').toDate();
    const karuraStableTokenHolder = await getHolder('KUSD', 'KARURA');
    const karuraStableTokenIssuance = await karuraWallet.getIssuance('KUSD');
    const karuraStable = await stableCoin(karuraApi, karuraWallet);
    const { total: karuraTotalLiquidToken, value: karuraTotalLiquidTokenValue } = await totalLiquidTokenTvl(karuraApi, karuraWallet);
    const { total: karuraTotalStakingTokenBridge, value: karuraTotalStakingTokenBridgeValue } = await stakingTokenBridgeTvl(karuraApi, karuraWallet);
    const karuraTotalLpTokenStaking = await lpTokenStakingTvl(karuraApi, karuraWallet);
    const karuraTotalLiquidityPool = await liquidityPoolTvl(karuraApi, karuraWallet);

    await pulseModal.create({
      network: 'KARURA',
      stableTokenIssuance: karuraStableTokenIssuance.toNumber(),
      stableTokenIssuanceValue: karuraStableTokenIssuance.toNumber(),
      stableTokenHolder: karuraStableTokenHolder,
      stableCoinValue: karuraStable.toNumber(),
      liquidToken: karuraTotalLiquidToken.toNumber(),
      liquidTokenValue: karuraTotalLiquidTokenValue.toNumber(),
      liquidTokenHolder: await getHolder('LKSM', 'KARURA'),
      bridge: karuraTotalStakingTokenBridge.toNumber(),
      bridgeValue: karuraTotalStakingTokenBridgeValue.toNumber(),
      lpTokenStakingValue: karuraTotalLpTokenStaking.toNumber(),
      liquidityPoolValue: karuraTotalLiquidityPool.toNumber(),
      lcDOTValue: 0,
      lcDOTHolder: 0,
      createTime: date
    });
    
    const acalaStableTokenHolder = await getHolder('AUSD', 'ACALA');
    const acalaStableTokenIssuance = await acalaWallet.getIssuance('AUSD');
    const acalaStable = await stableCoin(acalaApi, acalaWallet);
    const { total: acalaTotalLiquidToken, value: acalaTotalLiquidTokenValue } = await totalLiquidTokenTvl(acalaApi, acalaWallet);
    const { total: acalaTotalStakingTokenBridge, value: acalaTotalStakingTokenBridgeValue } = await stakingTokenBridgeTvl(acalaApi, acalaWallet);
    const acalaTotalLpTokenStaking = await lpTokenStakingTvl(acalaApi, acalaWallet);
    const acalaTotalLiquidityPool = await liquidityPoolTvl(acalaApi, acalaWallet)
    const { total: lcdot, value: lcdotValue } = await lcdotTvl(acalaWallet);
    const lcDOTHolder = await getHolder('lc://13', 'ACALA');

    await pulseModal.create({
      network: 'ACALA',
      stableTokenIssuance: acalaStableTokenIssuance.toNumber(),
      stableTokenIssuanceValue: acalaStableTokenIssuance.toNumber(),
      stableTokenHolder: acalaStableTokenHolder,
      stableCoinValue: acalaStable.toNumber(),
      liquidToken: acalaTotalLiquidToken.toNumber(),
      liquidTokenValue: acalaTotalLiquidTokenValue.toNumber(),
      liquidTokenHolder: await getHolder('LDOT', 'ACALA'),
      bridge: acalaTotalStakingTokenBridge.toNumber(),
      bridgeValue: acalaTotalStakingTokenBridgeValue.toNumber(),
      lpTokenStakingValue: acalaTotalLpTokenStaking.toNumber(),
      liquidityPoolValue: acalaTotalLiquidityPool.toNumber(),
      lcDOTValue: lcdotValue.toNumber(),
      lcDOTHolder: lcDOTHolder,
      createTime: date
    });
  }
}