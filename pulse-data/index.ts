import { Context } from 'koa';
import { pulseModal } from './db/modal';

export const pulseQuery = async (ctx: Context) => {
  const network = (ctx.request.query.network as 'acala' | 'karura').toUpperCase();

  const datas = await pulseModal.find({network: network}).sort({'createTime': -1}).limit(120);
  const dayData = datas.filter((item, i) => i % 3 === 0)
  const todayData = dayData[0];
  const yesterdayData = dayData[1];
  const weekData = dayData[6];
  const monthData = dayData[29];

  const totalTvlRecords = dayData.map(item => {
    return {
      value: item.stableCoinValue + item.liquidTokenValue + item.bridgeValue + item.liquidityPoolValue + item.lpTokenStakingValue + item.lcDOTValue,
      date: item.createTime
    }
  });
  const totalTVLData = {
    recods: totalTvlRecords,
    dayChange: (totalTvlRecords[0].value - totalTvlRecords[1].value) / totalTvlRecords[1].value,
  };
  const stableTokenData = {
    tvl: todayData.stableTokenIssuanceValue,
    dayChange: (todayData.stableTokenIssuanceValue - yesterdayData.stableTokenIssuanceValue) / yesterdayData.stableTokenIssuanceValue,
    weekChange: (todayData.stableTokenIssuanceValue - weekData.stableTokenIssuanceValue) / weekData.stableTokenIssuanceValue,
    monthChange: (todayData.stableTokenIssuanceValue - monthData.stableTokenIssuanceValue) / monthData.stableTokenIssuanceValue,
    holder: todayData.stableTokenHolder
  };
  const liquidStaking = {
    tvl: todayData.liquidTokenValue,
    dayChange: (todayData.liquidTokenValue - yesterdayData.liquidTokenValue) / yesterdayData.liquidTokenValue,
    weekChange: (todayData.liquidTokenValue - weekData.liquidTokenValue) / weekData.liquidTokenValue,
    monthChange: (todayData.liquidTokenValue - monthData.liquidTokenValue) / monthData.liquidTokenValue,
    holder: todayData.liquidTokenHolder,
  }
  const lcDot = {
    tvl: todayData.lcDOTValue,
    dayChange: (todayData.lcDOTValue - yesterdayData.lcDOTValue) / yesterdayData.lcDOTValue,
    weekChange: (todayData.lcDOTValue - weekData.lcDOTValue) / weekData.lcDOTValue,
    monthChange: (todayData.lcDOTValue - monthData.lcDOTValue) / monthData.lcDOTValue,
    holder: todayData.lcDOTHolder,
  }
  const swap = {
    tvl: todayData.lpTokenStakingValue + todayData.liquidityPoolValue,
    dayChange: (todayData.lpTokenStakingValue + todayData.liquidityPoolValue - yesterdayData.lpTokenStakingValue - yesterdayData.liquidityPoolValue) / (yesterdayData.lpTokenStakingValue + yesterdayData.liquidityPoolValue),
    weekChange: (todayData.lpTokenStakingValue + todayData.liquidityPoolValue - weekData.lpTokenStakingValue - weekData.liquidityPoolValue) / (weekData.lpTokenStakingValue + weekData.liquidityPoolValue),
    monthChange: (todayData.lpTokenStakingValue + todayData.liquidityPoolValue - monthData.lpTokenStakingValue - monthData.liquidityPoolValue) / (monthData.lpTokenStakingValue + monthData.liquidityPoolValue),
  }
  const bridge = {
    tvl: todayData.bridgeValue,
    dayChange: (todayData.bridgeValue - yesterdayData.bridgeValue) / yesterdayData.bridgeValue,
    weekChange: (todayData.bridgeValue - weekData.bridgeValue) / weekData.bridgeValue,
    monthChange: (todayData.bridgeValue - monthData.bridgeValue) / monthData.bridgeValue,
  }

  return ctx.body = {
    totalTVLData,stableTokenData,liquidStaking,lcDot,swap,bridge
  }
}