import axios from 'axios';
import { Context } from 'koa';
import { redis } from ".";

export const risk = async (ctx: Context) => {
  const address = ctx.request.query.address;

  if(!address) {
    return ctx.body = {
      error: 1,
      data: ''
    };
  }

  const redisdata = await redis.get(`risk:${address}`);
  if (redisdata) {
    return ctx.body = {
      error: 0,
      data: redisdata
    };
  }

  const data = await axios.post('https://api.merklescience.com/api/v4/addresses/', {
    identifier: address,
    blockchain: 12
  }, {
    headers: {
      "X-API-KEY": 'AYQ8L0XHA4WBNHJML6D4K8U3F4H0V0M7TJMN33IJSW'
    }
  })

  if(data.status.toString().startsWith('2')) {
    const result = {
      risk_level: data.data.risk_level,
      tag_type_verbose: data.data.tags?.owner?.tag_type_verbose || '',
      tag_subtype_verbose: data.data.tags?.owner?.tag_subtype_verbose || '',
      tag_name_verbose: data.data.tags?.owner?.tag_name_verbose || ''
    }

    await redis.set(`risk:${address}`, JSON.stringify(result), 'EX', 60 * 60 * 24);

    return ctx.body = {
      error: 0,
      data: JSON.stringify(result)
    }
  } else {
    return ctx.body = {
      error: 1,
      data: ''
    }
  }
};
