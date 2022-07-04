import { Wallet } from '@acala-network/sdk';
import { ApiPromise } from '@polkadot/api';
import { getTotalStaking } from './totalLiquidTokenTvl';

export const stakingTokenBridgeTvl = async (api: ApiPromise, wallet: Wallet) => {
  const getStakingCurrencyId = api.consts.prices.getStakingCurrencyId;
  const token = await wallet.getToken(getStakingCurrencyId as any);

  const price = await wallet.getPrice(token);

  const supply = await wallet.getIssuance(token);
  const supplyValue = supply.times(price);

  const total = await getTotalStaking(api, token);
  const stakingValue = total.times(price);

  return  {
    total: total.add(supply),
    value: supplyValue.add(stakingValue)
  }
};