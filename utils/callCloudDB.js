const getAccessToken = require('./getAccessToken')
const axios = require('axios')

const callCloudDB = async (ctx,fnName,query = {}) => {
  const ACCESS_TOKEN = await getAccessToken()
  const options = {
    method: 'post',
    url: `https://api.weixin.qq.com/tcb/${fnName}?access_token=${ACCESS_TOKEN}`,
    data: {
      query,
      env:ctx.state.env
    }
  }

  return await axios(options).then((res) => {
    return res.data
  }).catch((err) => {
    console.log(err)
  })
}

module.exports =  callCloudDB