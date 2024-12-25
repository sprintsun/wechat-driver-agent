import path from 'path'
import os from 'os'
import automator from 'miniprogram-automator'
import { lowerFirst, isObject } from 'lodash'
import globalState from './state'
import { InvalidSessionIdError, InvalidArgumentError } from '../utils/error'
import logger from './logger'
import { installApp, getAppConfig, saveAppConfig } from './app'
import { generateDeviceKey, updateLyrebirdConfig } from './lyrebird'
import { getIPAddress, killProcess, wait } from '../utils/common'
import { release } from './service-manager'

declare let wx: any
let timer: NodeJS.Timeout | null = null // 定时器

// 小程序默认安装路径
const DEFAULT_APP_PATH = path.join(os.homedir(), '/shortlink/mini-app')
// 线上环境
const prodMode = process.env.NODE_ENV === 'production'

// 小程序默认启动的页面
const DEFAULT_PAGE_PATH = '/pages/index/index'

// 小程序开发者工具是否正在关闭中
let isClosing = false

async function closeMiniProgram(): Promise<void> {
  if (isClosing) {
    throw new Error(
      `miniProgram devtools is in the process of closing, please try again later, ip: ${getIPAddress()}`
    )
  }
  const miniProgram = globalState.getValue('miniProgram')
  if (miniProgram) {
    isClosing = true
    try {
      await miniProgram.close()
      logger.debug('waiting to close miniProgram devtools')
      await wait(5000)
    } catch (err: any) {
      logger.error(
        `unable to close miniProgram devtools, trying to kill process, error: ${err}`
      )
      await killProcess()
    }
  }
  globalState.reset()
  isClosing = false
}

// 将参数 key 的首字母改为小写，以兼容 shortlink 中不规范的传参
function transformKeys(capabilities) {
  if (!capabilities || !isObject(capabilities)) {
    return capabilities
  }
  return Object.keys(capabilities).reduce((prev, curr) => {
    const key = lowerFirst(curr)
    prev[key] = capabilities[curr]
    return prev
  }, {})
}

function updateGlobalState(params) {
  const { sessionId } = params
  const capabilities = transformKeys(params.capabilities?.alwaysMatch)
  globalState.setValue('sessionId', sessionId)
  globalState.setValue('capabilities', capabilities)

  const appPath = capabilities?.appPath ?? path.resolve(DEFAULT_APP_PATH)
  const pagePath = capabilities?.pagePath ?? DEFAULT_PAGE_PATH
  globalState.setConfig('appPath', appPath)
  globalState.setConfig('pagePath', pagePath)
}

// 设置 deubglink 到小程序插件
async function setWxDebugConfig() {
  const capabilities = globalState.getValue('capabilities')
  const miniProgram = globalState.getValue('miniProgram')
  const urlScheme = capabilities?.processArguments?.env?.env_urlScheme
  if (urlScheme) {
    // callWXMethod 会卡住，只能用 evaluate 方法进行调用
    // await miniProgram.callWxMethod('setDebugConfig', urlScheme)
    const res = await miniProgram.evaluate((scheme) => {
      return wx.setDebugConfig(scheme)
    }, urlScheme)
    if (res) {
      logger.debug(
        `[create session] setDebugConfig successfully, urlScheme: ${urlScheme}`
      )
    } else {
      logger.error(
        `[create session] setDebugConfig failed, urlScheme: ${urlScheme}`
      )
    }
  }
}

// 启动微信开发者工具
async function launch() {
  const capabilities = globalState.getValue('capabilities')
  const appPath = globalState.getConfig('appPath')
  const appConfig = await getAppConfig(appPath)

  // 启动之前，先更新 lyrebird 配置
  const deviceKey = appConfig?.deviceKey
  const mpServerUrl = capabilities?.mpServerUrl
  if (deviceKey && mpServerUrl) {
    logger.debug(`[create session] lyrebird config is being updated...`)
    await updateLyrebirdConfig(deviceKey, mpServerUrl)
  }

  logger.debug(`[create session] miniProgram devtools launching...`)
  const app = capabilities?.app
  const ticket = capabilities?.ticket
  const projectPath = app ? `${appPath}/build` : appPath
  let miniProgram
  // 线上环境必须传递 ticket
  if (prodMode && !ticket) {
    logger.error('capabilities.ticket can’t be empty')
    throw new InvalidArgumentError('capabilities.ticket can’t be empty')
  }
  try {
    const options = {
      projectPath,
      projectConfig: {
        libVersion: '2.20.0', // 项目中默认为"2.10.4"，因为 lyrebird 中使用一些比较新的 API，所以这里必须改为较新的"2.20.0"才能够运行应用
      },
    }
    // 调试的时候可以不传 ticket
    if (ticket) {
      options['ticket'] = ticket
    }
    // 如果无法启动开发者工具，卡在 launch 这一步，请检查微信开发者工具设置 - 安全设置中，是否打开了“服务端口”选项
    miniProgram = await automator.launch(options)
  } catch (err: any) {
    logger.error(
      `[create session] unable to launch miniProgram devtools, trying to kill process`
    )
    await killProcess()
    throw new Error(
      `miniProgram devtools launch failed, ip: ${getIPAddress()}, error: ${err}`
    )
  }
  globalState.setValue('miniProgram', miniProgram)
  logger.debug(`[create session] miniProgram devtools launch successfully`)
  return miniProgram
}


function startTimer() {
  // 30分钟后启动一个检查任务
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(async () => {
    const lastRequestTime = globalState.getConfig('lastRequestTime')
    // 15分钟内如果没有新的请求进来，则主动释放该机器资源
    if (Date.now() - lastRequestTime > 15 * 60 * 1000) {
      logger.debug(
        `[timer] waiting for release, lastRequestTime: ${lastRequestTime}`
      )
      await release()
      timer = null
    }
  }, 30 * 60 * 1000)
}

async function clearStorage() {
  const miniProgram = globalState.getValue('miniProgram')
  try {
    await miniProgram.callWxMethod('clearStorageSync', null)
    logger.debug(`[create session] call clearStorageSync successfully`)
  } catch (err: any) {
    logger.error(
      `[create session] call clearStorageSync failed, error message: ${err.message}`
    )
    throw new Error('clearStorageSync failed')
  }
}

export const createSession = async function (params) {
  const beginTime = Date.now()
  logger.debug('[create session] begin...')

  // 启动一个定时器
  startTimer()

  // 先尝试去关闭小程序，并重置状态
  await closeMiniProgram()
  logger.debug('[create session] reset state successfully')

  // 将请求参数更新到服务的全局状态中
  updateGlobalState(params)
  logger.debug(`[create session] update global state successfully`)

  // 安装小程序
  const capabilities = globalState.getValue('capabilities')
  const app = capabilities?.app
  const appPath = globalState.getConfig('appPath')
  if (app) {
    await installApp({ app, appPath })
  } else {
    logger.error('capabilities.app can’t be empty')
    throw new InvalidArgumentError('capabilities.app can’t be empty')
  }

  let miniProgram: any = await launch()

  // 清空小程序数据缓存
  await clearStorage()

  // 读取配置信息
  const appConfig = await getAppConfig(appPath)
  if (appConfig && appConfig?.installed !== true) {
    // 只有第一次安装小程序包时，才需要重启开发者工具
    logger.debug(`[create session] miniProgram devtools relaunch`)
    // 把deviceKey缓存下来，供lyrebird插件使用
    appConfig.deviceKey = await generateDeviceKey(miniProgram)
    await saveAppConfig(appPath, appConfig)
    miniProgram = await launch()
  }


  // 设置 deubglink 到小程序插件
  await setWxDebugConfig()

  // 将已安装状态写入本地磁盘，后续不需要再做重启
  if (appConfig?.installed !== true) {
    await saveAppConfig(appPath, { ...appConfig, installed: true })
  }

  // createSession 的执行耗时，单位秒
  const execTime = (Date.now() - beginTime) / 1000
  logger.debug(`[create session] finish, execution time: ${execTime}s`)
  return true
}

export const getSession = async function () {
  const capabilities = globalState.getValue('capabilities')
  return capabilities || null
}

export const deleteSession = async function (sessionId) {
  logger.debug('[delete session] begin...')
  if (globalState.getValue('sessionId') !== sessionId) {
    logger.error('[delete session] miniProgram devtools close error')
    throw new InvalidSessionIdError()
  }

  await closeMiniProgram()
  logger.debug('[delete session] finish')
  return true
}
