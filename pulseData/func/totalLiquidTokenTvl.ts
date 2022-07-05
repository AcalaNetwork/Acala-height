import { Wallet } from '@acala-network/sdk';
import { FixedPointNumber, forceToCurrencyName, Token } from '@acala-network/sdk-core';
import { ApiPromise } from '@polkadot/api';

export const getTotalStaking = async (api: ApiPromise, token: Token) => {
  const toBond = await api.query.homa.toBondPool();
  const stakingLedgers = await api.query.homa.stakingLedgers.entries();
  let totalInSubAccount = FixedPointNumber.ZERO;

  stakingLedgers.map(item => {
    const ledge = (item[1] as any).unwrapOrDefault();
    totalInSubAccount = totalInSubAccount.add(FixedPointNumber.fromInner(ledge.bonded.unwrap().toString(), token.decimals));
  })

  const total = FixedPointNumber.fromInner(toBond.toString(), token.decimals).add(totalInSubAccount);

  return total;
}

export const totalLiquidTokenTvl = async (api: ApiPromise, wallet: Wallet) => {
  const getStakingCurrencyId = api.consts.prices.getStakingCurrencyId;
  const stakingToken = await wallet.getToken(getStakingCurrencyId as any);
  const price = await wallet.getPrice(stakingToken);
  
  const total = await getTotalStaking(api, stakingToken)
  const value = total.times(price);

  return {
    total,
    value
  }
}