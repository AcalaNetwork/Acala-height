import { Wallet } from '@acala-network/sdk';
import { FixedPointNumber, forceToCurrencyName } from '@acala-network/sdk-core';
import { ApiPromise } from '@polkadot/api';

export const stableCoin = async (api: ApiPromise, wallet: Wallet) => {
  let locked = FixedPointNumber.ZERO;

  const data = await api.query.loans.totalPositions.entries();

  for (let i = 0; i < data.length; i++) {
    const [_token, amount] = data[i];
    const token = await wallet.getToken(forceToCurrencyName((_token.args as any)[0]));
    const collateral = FixedPointNumber.fromInner((amount as any).collateral.toString(), token.decimals);
    const price = await wallet.getPrice(token.name);

    locked = locked.add(collateral.times(price));
  }

  return locked;
}