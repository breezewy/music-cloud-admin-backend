const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router')
const router = new Router()
const cors = require('koa2-cors')
const koaBody = require('koa-body')
const ENV = 'development-8gcxm1si2cfdf385'

// 跨域
app.use(cors({
  origin: ['http://localhost:9528'],
  credentials:true
}))

// 接受post参数解析
// 通过这个中间件，前端的post参数就能传递过来
app.use(koaBody({
  multipart:true
}))

// 全局中间件，应该写在其他中间件的上面
app.use(async (ctx, next) => {
  console.log('全局中间件')
  ctx.state.env = ENV
  // 执行完全局中间件的时候，还要执行下边的中间件，所以需要调用next方法
  await next()
})

const playlist = require('./controller/playlist.js')
const swiper = require('./controller/swiper.js')
const blog = require('./controller/blog.js')
router.use('/playlist', playlist.routes())
router.use('/swiper', swiper.routes())
router.use('/blog',blog.routes())

app.use(router.routes())
// 请求方法有很多，常用的方法比如 get,post,allowedMethods是允许这些方法的使用
app.use(router.allowedMethods())



app.listen(3000, () => {
  console.log('服务开启在3000端口')
})