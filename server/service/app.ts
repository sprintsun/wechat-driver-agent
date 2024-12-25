import fs from 'fs'
import path from 'path'
import shell from 'shelljs'
import { InvalidArgumentError } from '../utils/error'
import logger from './logger'

interface I_Params {
  app: string // 项目压缩包下载地址
  appPath: string // 项目安装地址
}

export interface I_AppConfig {
  url?: string
  installed?: boolean
  deviceKey?: string
}

function download(appPath) {
  logger.debug(`[shell] download start: ${appPath}`)
  const res = shell.exec(`curl -o dist.zip ${appPath}`)
  if (res.code !== 0) {
    logger.error(`[shell] file downloaded failed: ${res.stderr}`)
    throw new Error('file downloaded failed')
  }
  logger.debug('[shell] file downloaded successfully')
}

function unzip(filePath, targetPath) {
  logger.debug(`[shell] unzip start: ${filePath}`)
  const res = shell.exec(`unzip -q -d ${targetPath} ${filePath}`)
  if (res.code !== 0) {
    logger.error(`[shell] unzip failed: ${res.stderr}`)
    throw new Error('unzip failed')
  }
  logger.debug('[shell] unzip successfully')
}

export function getAppConfig(dirPath): I_AppConfig | null {
  const filePath = path.join(dirPath, 'app.json')
  if (shell.test('-f', filePath)) {
    try {
      const appConfig = JSON.parse(
        fs.readFileSync(filePath, { encoding: 'utf-8' })
      )
      return appConfig
    } catch (err: any) {
      throw new Error(err.message)
    }
  }
  return null
}

export function saveAppConfig(dirPath, data: I_AppConfig) {
  const filePath = path.join(dirPath, 'app.json')
  try {
    fs.writeFileSync(filePath, JSON.stringify(data), { encoding: 'utf-8' })
  } catch (err: any) {
    throw new Error(err.message)
  }
}

export const installApp = async function (params: I_Params) {
  const { app, appPath } = params

  if (!appPath) {
    logger.error('[installApp] appPath can’t be empty')
    throw new InvalidArgumentError('appPath can’t be empty')
  }

  let isAppInstalled = false
  if (shell.test('-e', appPath)) {
    logger.debug(`[shell] directory exists: ${appPath}`)
    const appConfig = getAppConfig(appPath)
    if (appConfig && appConfig.url === app) {
      isAppInstalled = true
      logger.debug(`[shell] mini-app is installed: ${app}`)
    } else {
      // 删除原来的目录
      shell.rm('-rf', appPath)
      logger.debug(`[shell] remove the directory: ${appPath}`)
    }
  }

  if (!isAppInstalled) {
    // 创建目录
    shell.mkdir('-p', appPath)
    // 设置目录权限
    shell.chmod(777, appPath)
    logger.debug(`[shell] mkdir successfully: ${appPath}`)
    // 进入目录
    shell.cd(`${appPath}`)
    // 下载
    download(app)
    // 解压
    unzip(`${appPath}/dist.zip`, appPath)
    // 将下载地址记录下来
    saveAppConfig(appPath, { url: app })
    logger.debug(`[shell] mini-app installed successful`)
  }
}
