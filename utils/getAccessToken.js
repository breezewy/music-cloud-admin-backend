const axios = require('axios') 
const APPID = 'wx13c4ba61e6605db3'
const APPSECRET = 'e7318761870106efad750ad55c32ec40'
const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
const fs = require('fs')
const path = require('path')
// 存储access_token的json文件的路径
const fileName = path.resolve(__dirname, './access_token.json')

// 更新access_token的方法(第一次是获取并保存)
const updateAccessToken = async () => {
  const resStr = await axios.get(url)
  const access_token = resStr.data.access_token
  // 如果请求到了access_token
  if (access_token) {
    // 就写文件
    fs.writeFileSync(fileName, JSON.stringify({
      access_token,
      createTime:new Date()  // 存access_token的时候，配合createTime以方便计算过期时间
    }))
  } else {
    // 在access_token没有获取到的情况下，再次调用updateAccessToken去获取access_token
    await updateAccessToken()
  }
}

// 每两个小时更新一下access_token
// 一般情况下，不是等到2个小时才更新，而是提前五分钟
setInterval(async () => { 
  await updateAccessToken()
},(7200 - 300) * 1000)

// 取access_token的方法
const getAccessToken = async () => {
  // 假如是第一次调用，access_token还没有生成，那么这个函数会报错，因为找不到access_token.json文件
  // 所以要放入 try catch进行异常捕获,在捕获到异常的时候，去更新一下access_token
  // 更新完成以后，再去读取access_token，所以需要再次调用一下getAccessToken
  try {
    //读取文件
    const readRes = fs.readFileSync(fileName, 'utf8')
    const readObj = JSON.parse(readRes)
    // 在我们获取access_token的时候，虽然每2个小时会更新一下access_token，但是因为更新的代码时放在服务器上的，假如服务器宕机了，
    // 超过了2个小时，那么当我们再去调用getAccessToken的时候，获取的就是过期的access_token，这明细是不行的。
    // 所以，我们在获取access_token的方法里，加入判断逻辑，判断JSON文件里存的access_token的createTime和当前调用获取方法的时间的间隔
    // 如果间隔超过2个小时，就更新access_token并重新获取
    const createTime = new Date(readObj.createTime).getTime()
    const nowTime = new Date().getTime()
    if ((nowTime - createTime)/1000/60/60 >= 2) {
      await updateAccessToken()
      await getAccessToken()
    }
    return readObj.access_token
  } catch (error) {
    await updateAccessToken()
    await getAccessToken()
  }
}

module.exports = getAccessToken