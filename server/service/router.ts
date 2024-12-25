import fs from 'fs'
import path from 'path'
import { Context } from 'koa'
import Router from 'koa-router'
import logger from './logger'
import globalState from './state'

const router = new Router()

// 读取 controller 目录配置的路由信息
function initController() {
  let result = []
  const absolutePath = path.join(__dirname, '../controller')
  let routerFileList = fs.readdirSync(absolutePath)
  if (routerFileList && routerFileList.length) {
    // index.ts 文件用来兜底
    routerFileList = routerFileList.filter((item) => item !== 'index.ts')
    routerFileList.push('index.ts')
    routerFileList.forEach((file) => {
      // 加载每个路由配置文件
      const routerConfig = require(path.join(absolutePath, file)) // eslint-disable-line
      if (routerConfig?.default?.length) {
        result = result.concat(routerConfig.default)
      }
    })
  }
  return result
}

function render(ctx, View) {
  return (props) => {
    ctx.type = 'text/html'
    ctx.body = `<!DOCTYPE html>${View(props)}`
  }
}

function initRouter(routerConfig) {
  routerConfig.forEach((config) => {
    const { method = 'get', view = 'index.ts', controller, log = true } = config
    const Page = require(path.join(__dirname, '../view', view)) // eslint-disable-line
    router[method.toLowerCase()](config.path, async (ctx: Context, next) => {
      if (log) {
        const message = `${ctx.request.method} ${
          ctx.request.path
        }, params: ${JSON.stringify(ctx.request.body)}`
        logger.debug(message)
        globalState.setConfig('lastRequestTime', Date.now())
      }
      ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      ctx.render = render(ctx, Page)
      const result = await controller.call(ctx, next)
      // 如果 controller 中有 return value 而不是直接调用 render 方法
      // 表示这个 route 是要返回数据而不是页面
      if (typeof result !== 'undefined') {
        ctx.type = 'application/json'
        ctx.body = result
      }
    })
  })
}

export const routes = initController()
export function use(app) {
  initRouter(routes)
  app.use(router.routes()).use(router.allowedMethods())
}
