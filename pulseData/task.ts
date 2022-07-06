import { Wallet } from '@acala-network/sdk';
import { pulseModal } from './db/modal';
import { getApi } from './func/api';
import { lcdotTvl } from './func/lcdotTvl';
import { liquidityPoolTvl } from './func/liquidityPoolTvl';
import { lpTokenStakingTvl } from './func/lpTokenStakingTvl';
import { stableCoin } from './func/stablecoin';
import { stakingTokenBridgeTvl } from './func/stakingTokenBridgeTvl';
import { totalLiquidTokenTvl } from './func/totalLiquidTokenTvl';
import schedule from 'node-schedule';
import { getHolder } from './func/getHolder';
import dayjs from 'dayjs';
import { ApiDecoration } from '@polkadot/api/types';

export const _task = async (karApi?: ApiDecoration<"promise">, acaApi?: ApiDecoration<"promise">) => {
  const date = dayjs().startOf('hour').toDate();
  const karuraApi = karApi ? karApi : await getApi('karura');
  const karuraWallet = new Wallet(karuraApi, {
    supportAUSD: true,
  });

  await karuraApi.isReady;
  console.log('karura api ready!')
  await karuraWallet.isReady;
  console.log('karura wallet ready!')
  console.log('--------------- start karura data fetch ---------------')
  const karuraStableTokenHolder = await getHolder('KUSD', 'KARURA');
  const karuraStableTokenIssuance = await karuraWallet.getIssuance('KUSD');
  const karuraStable = await stableCoin(karuraApi, karuraWallet);
  const { total: karuraTotalLiquidToken, value: karuraTotalLiquidTokenValue } = await totalLiquidTokenTvl(karuraApi, karuraWallet);
  const { total: karuraTotalStakingTokenBridge, value: karuraTotalStakingTokenBridgeValue } = await stakingTokenBridgeTvl(karuraApi, karuraWallet);
  const karuraTotalLpTokenStaking = await lpTokenStakingTvl(karuraApi, karuraWallet);
  const karuraTotalLiquidityPool = await liquidityPoolTvl(karuraApi, karuraWallet);
  // const karuraSwap = karuraTotalLiquidityPool.add(karuraTotalLpTokenStaking)
  // const karuraTotal = karuraStable.add(karuraTotalLiquidTokenValue).add(karuraTotalStakingTokenBridgeValue).add(karuraSwap)
  console.log('--------------- end karura data fetch ---------------')

  console.log('--------------- start karura db insert ---------------')
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
  console.log('--------------- end karura db insert ---------------')

  const acalaApi = acaApi ? acaApi : await getApi('acala');
  const acalaWallet = new Wallet(acalaApi, {
    supportAUSD: true,
  });

  await acalaApi.isReady;
  console.log('acala api ready!')
  await acalaWallet.isReady;
  console.log('acala wallet ready!')
  console.log('--------------- start acala data fetch ---------------')
  const acalaStableTokenHolder = await getHolder('AUSD', 'ACALA');
  const acalaStableTokenIssuance = await acalaWallet.getIssuance('AUSD');
  const acalaStable = await stableCoin(acalaApi, acalaWallet);
  const { total: acalaTotalLiquidToken, value: acalaTotalLiquidTokenValue } = await totalLiquidTokenTvl(acalaApi, acalaWallet);
  const { total: acalaTotalStakingTokenBridge, value: acalaTotalStakingTokenBridgeValue } = await stakingTokenBridgeTvl(acalaApi, acalaWallet);
  const acalaTotalLpTokenStaking = await lpTokenStakingTvl(acalaApi, acalaWallet);
  const acalaTotalLiquidityPool = await liquidityPoolTvl(acalaApi, acalaWallet)
  const {total: lcdot, value: lcdotValue} = await lcdotTvl(acalaWallet);
  const lcDOTHolder = await getHolder('lc://13', 'ACALA');
  // const acalaSwap = acalaTotalLiquidityPool.add(acalaTotalLpTokenStaking)
  // const acalaTotal = acalaStable.add(acalaTotalLiquidTokenValue).add(acalaTotalStakingTokenBridgeValue).add(acalaSwap).add(lcdotValue)
  console.log('--------------- end acala data fetch ---------------')

  console.log('--------------- start acala db insert ---------------')
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
  console.log('--------------- end acala db insert ---------------')
}

export const scheduledTask = () => {
  schedule.scheduleJob('0 0 4,12,20 * * *', async () => {
    await _task()
    // console.log(new Date())
  });
}