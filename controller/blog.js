const Router = require('koa-router')
const router = new Router()
const callCloudDB = require('../utils/callCloudDB')
const cloudStorage = require('../utils/callCloundStorage')

router.get('/list', async (ctx, next) => {
  const params = ctx.request.query
  const query = `
    db.collection('blog').skip(${params.start}).limit(${params.count}).orderBy('createTime','desc').get()
  `
  const res = await callCloudDB(ctx, 'databasequery', query)
  ctx.body = {
    code: 20000,
    data:res.data
  }
})

router.post('/del', async (ctx, next) => {
  // 取到前端请求发送的参数
  // get请求是通过 ctx.request.query
  // post请求是通过请求体 ctx.request.body
  const params = ctx.request.body

  // 删除blog
  const queryBlog = `db.collection('blog').doc('${params._id}').remove()`
  const delBlogRes = await callCloudDB(ctx,'databasedelete',queryBlog)

  // 删除blog评论
  const queryComment = `db.collection('blog-comment').where({
    blogId:'${params._id}'
  }).remove()`
  const delBlogCommentRes = await callCloudDB(ctx, 'databasedelete', queryComment)
  
  // 删除对应的图片
  const delStorageRes = await cloudStorage.delete(ctx, params.img)
  
  ctx.body = {
    code: 20000,
    data: {
      delBlogRes,
      delBlogCommentRes,
      delStorageRes
    }
  }
})

module.exports = router