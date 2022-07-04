import { Wallet } from '@acala-network/sdk';
import { FixedPointNumber, forceToCurrencyName } from '@acala-network/sdk-core';
import { ApiPromise } from '@polkadot/api';

export const liquidityPoolTvl = async (api: ApiPromise, wallet: Wallet) => {
  const data = await api.query.dex.liquidityPool.entries();
  let total = FixedPointNumber.ZERO;

  for (let i = 0; i < data.length; i++) {
    const [token, amount] = data[i];
    const tokenA = await wallet.getToken(forceToCurrencyName((token.args[0] as any)[0]));
    const tokenB = await wallet.getToken(forceToCurrencyName((token.args[0] as any)[1]));
    const amountA = FixedPointNumber.fromInner((amount as any)[0].toString(), tokenA.decimals);
    const amountB = FixedPointNumber.fromInner((amount as any)[1].toString(), tokenB.decimals);
    const priceA = await wallet.getPrice(tokenA);
    const priceB = await wallet.getPrice(tokenB);

    total = total.add(amountA.times(priceA)).add(amountB.times(priceB));

  }

  return total;
}