const Router = require('koa-router')
const router = new Router()
const callCloudDB = require('../utils/callCloudDB')
const cloudStorage = require('../utils/callCloundStorage')

router.get('/list', async (ctx, next) => {
  // 小程序端从云数据库获取数据默认一次是20条，云函数从云数据库获取数据默认一次是100条
  // HTTP API从云数据库获取数据，默认是10条
  const query = `db.collection('swiper').get()`
  const res = await callCloudDB(ctx, 'databasequery', query)

  // 因为fileid不能在网页上用来显示图片，所以需要获取文件下载链接
  let fileList = []
  const data = res.data
  for (let i = 0, len = data.length; i < len; i++) {
    fileList.push({
      fileid: JSON.parse(data[i]).fileid,
      max_age: 7200
    })
  }
  const dlRes = await cloudStorage.download(ctx, fileList)
  const flList = dlRes.data.file_list

  let returnData = []
  for (let i = 0, len = flList.length; i < len; i++){
    returnData.push({
      download_url: flList[i].download_url,
      fileid: flList[i].fileid,
      _id:JSON.parse(data[i])._id
    })
  }

  ctx.body = {
    code: 20000,
    data: returnData
  }
})

router.post('/upload', async (ctx, next) => {
  const fileid = await cloudStorage.upload(ctx)
  // console.log(fileid)

  // 写数据库
  const query = `db.collection('swiper').add({
    data:{
      fileid:'${fileid}'
    }
  })`
  const res = await callCloudDB(ctx, 'databaseadd', query)
  ctx.body = {
    code: 20000,
    id_list:res.id_list
  }
})

router.get('/del', async (ctx, next) => {
  const params = ctx.request.query
  console.log(params)
  // 删除云数据库中的内容
  const query = `
    db.collection('swiper').doc('${params._id}').remove()
  `
  const delDBRes = await callCloudDB(ctx, 'databasedelete', query)

  // 删除云存贮中的文件
  const delStorageRes = await cloudStorage.delete(ctx, [params.fileid])
  ctx.body = {
    code: 20000,
    data: {
      delDBRes,
      delStorageRes
    }
  }
})

module.exports = router