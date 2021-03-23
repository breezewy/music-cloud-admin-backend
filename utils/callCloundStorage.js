const getAccessToken = require('./getAccessToken')
const axios = require('axios')
const rp = require('request-promise')
const fs = require('fs')

const cloudStorage = {
  async download(ctx, fileList) {
    const ACCESS_TOKEN = await getAccessToken()
    const options = {
      method: 'post',
      url: `https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${ACCESS_TOKEN}`,
      data: {
        env: ctx.state.env,
        file_list:fileList
      }
    }

    return await axios(options).then((res) => {
      return res
    }).catch((err) => {
      console.error(err)
    })
  },

  async upload(ctx) {
    // 1.请求地址
    const ACCESS_TOKEN = await getAccessToken()
    const file = ctx.request.files.file
    console.log(ctx.request.files)
    const path = `swiper/${Date.now()}-${Math.random()}-${file.name}`
    const options = {
      method: 'post',
      url: `https://api.weixin.qq.com/tcb/uploadfile?access_token=${ACCESS_TOKEN}`,
      data: {
        path,
        env: ctx.state.env
      }
    }

    const info =  await axios(options).then((res) => {
      return res.data
    }).catch((err) => {
      console.error(err)
    })


    // 2. 上传图片
    const params = {
      method: 'post',
      headers: {
        'content-type':'multipart/form-data'
      },
      uri: info.url,
      formData: {
        key: path,
        Signature:info.authorization,
        'x-cos-security-token': info.token,
        'x-cos-meta-fileid': info.cos_file_id,
        file:fs.createReadStream(file.path)
      },
      json:true
    }
    await rp(params)
    return info.file_id
  },

  async delete(ctx, fileid_list) {
    const ACCESS_TOKEN = await getAccessToken()
    const options = {
      method: 'post',
      url: `https://api.weixin.qq.com/tcb/batchdeletefile?access_token=${ACCESS_TOKEN}`,
      body: {
        fileid_list,
        env: ctx.state.env
      },
      json:true
    }
    return await rp(options).then((res) => {
      return res
    }).catch((err) => {
      console.error(err)
    })
  }
}

module.exports = cloudStorage