const { ApiPromise, WsProvider } = require("@polkadot/api");
const { options } = require("@acala-network/api");

const ACALA_ENDPOINTS = [
  "wss://acala.polkawallet.io",
];

const KARURA_ENDPOINTS = [
  "wss://karura.api.onfinality.io/public-ws"
];

export const getApi = async (chainName: 'acala' | 'karura') => {
  let apiOptions;

  if (chainName === "acala") {
    apiOptions = options({ provider: new WsProvider(ACALA_ENDPOINTS) });
  } else {
    apiOptions = options({ provider: new WsProvider(KARURA_ENDPOINTS) });
  }

  return ApiPromise.create(apiOptions);
};