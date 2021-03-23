// 把后端调用小程序云函数的方法，封装为一个独立的文件

const getAccessToken = require('./getAccessToken')
const axios = require('axios')

const callCloudFn = async (ctx, fnName, params) => {
  const ACCESS_TOKEN = await getAccessToken()
  const options = {
    method: 'post',
    url: `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${ACCESS_TOKEN}&env=${ctx.state.env}&name=${fnName}`,
    data: {
      ...params
    }
  }

  return await axios(options)
    .then((res) => {
      // console.log(res)
      return res.data
    })
    .catch((err) => {
      console.error(err)
    })
}

module.exports = callCloudFn