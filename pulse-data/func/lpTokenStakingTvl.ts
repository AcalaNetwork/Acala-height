import { Wallet } from '@acala-network/sdk';
import { FixedPointNumber, forceToCurrencyName } from '@acala-network/sdk-core';
import { ApiPromise } from '@polkadot/api';

export const lpTokenStakingTvl = async (api: ApiPromise, wallet: Wallet) => {
  const data = await api.query.rewards.poolInfos.entries();
  let total = FixedPointNumber.ZERO;
  const filterData = data.filter((item) => {
    const [token] = item;

    return (token.toHuman() as any)[0].hasOwnProperty('Dex');
  });

  for (let i = 0; i < filterData.length; i++) {
    const [token, amount] = filterData[i];

    const lpToken = await wallet.getToken(forceToCurrencyName((token.args[0] as any).asDex));
    const totalShares = FixedPointNumber.fromInner((amount as any).totalShares.toString(), lpToken.decimals);
    const price = await wallet.getPrice(lpToken.name);

    total = total.add(totalShares.times(price));
  }

  return total;
}