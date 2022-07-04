import mongo from 'mongoose';

export interface IPulse {
  network: string;
  stableTokenIssuance: number;
  stableTokenIssuanceValue: number;
  stableTokenHolder: number;
  stableCoinValue: number;
  liquidToken: number;
  liquidTokenValue: number;
  liquidTokenHolder: number,
  bridge: number;
  bridgeValue: number;
  lpTokenStakingValue: number;
  liquidityPoolValue: number;
  lcDOTValue: number;
  lcDOTHolder: number;

  createTime: Date
}

const pulseSchema = new mongo.Schema({
  network: String,
  stableTokenIssuance: Number,
  stableTokenIssuanceValue: Number,
  stableTokenHolder: Number,
  stableCoinValue: Number,
  liquidToken: Number,
  liquidTokenValue: Number,
  liquidTokenHolder: Number,
  bridge: Number,
  bridgeValue: Number,
  lpTokenStakingValue: Number,
  liquidityPoolValue: Number,
  lcDOTValue: Number,
  lcDOTHolder: Number,

  createTime: {
    type: Date,
    default: new Date(),
    index: true
  }
});

export const pulseModal = mongo.model<IPulse>('pulse', pulseSchema);