import { Wallet } from '@acala-network/sdk/wallet';

export const lcdotTvl = async (wallet: Wallet) => {
  const supply = await wallet.getIssuance('lc://13')
  const price = await wallet.getPrice('DOT');

  return  {
    total: supply,
    value: supply.times(price)
  }
};