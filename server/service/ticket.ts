import path from 'path'
import os from 'os'
import automator from 'miniprogram-automator'
import globalState from './state'
import logger from './logger'
import { killProcess } from '../utils/common'

declare let wx: any

// 小程序默认安装路径
const DEFAULT_APP_PATH = path.join(os.homedir(), '/shortlink/mini-app')

async function getMiniProgram(): Promise<any> {
  let miniProgram = globalState.getValue('miniProgram')
  if (miniProgram) {
    return miniProgram
  }

  logger.debug(`[get new Ticket] miniProgram devtools launching...`)
  const projectPath = path.resolve(DEFAULT_APP_PATH)

  try {
    // 如果无法启动开发者工具，卡在 launch 这一步，请检查微信开发者工具设置 - 安全设置中，是否打开了“服务端口”选项
    miniProgram = await automator.launch({
      projectPath,
      projectConfig: {
        libVersion: '2.20.0', // 项目中默认为"2.10.4"，因为 lyrebird 中使用一些比较新的 API，所以这里必须改为较新的"2.20.0"才能够运行应用
      },
    })
  } catch (err: any) {
    logger.error(
      `[get new Ticket] unable to launch miniProgram devtools, trying to kill process`
    )
    await killProcess()
    throw new Error('miniProgram devtools launch failed')
  }
  globalState.setValue('miniProgram', miniProgram)
  logger.debug(`[get new Ticket] miniProgram devtools launch successfully`)
  return miniProgram
}

export const getNewTicket = async function (params) {
  logger.debug('[get new Ticket] begin...')
  const miniProgram = await getMiniProgram()
  try {
    await miniProgram.refreshTicket()
    const ticket = await miniProgram.getTicket()
    logger.debug(`[get new Ticket] finish, ticket: ${JSON.stringify(ticket)}`)
    return ticket
  } catch (err: any) {
    globalState.setValue('miniProgram', null)
    logger.error(`[get new Ticket] get ticket error: ${err}`)
  }
  return ''
}
