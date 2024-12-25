import Koa from 'koa'
import serve from 'koa-static'
import koaBody from 'koa-body'
import { resolve } from 'path'
import config from './config'
import { use } from './service/router'
import logger from './service/logger'
import { register } from './service/service-manager'
import errorMiddleware from './middleware/error'

const app = new Koa()

// body parser
app.use(koaBody({ multipart: true, jsonLimit: '10mb' }))

// 静态服务初始化
// if (env === 'local') {
const staticPath = resolve(__dirname, '../dist')
app.use(serve(staticPath, { maxage: 30 * 24 * 3600 * 1000 })) // 30天
// }

// 404 && 500 处理
app.use(errorMiddleware)

// 全局路由初始化
use(app)

app.listen(config.port)
logger.info(`node service listening on port ${config.port}...`)

if (process.env.AUTO_REGISTER !== '0') {
  register()
}

app.on('error', (err) => {
  logger.error(`server error, ${err}`)
})

module.exports = app
