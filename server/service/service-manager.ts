import axios from 'axios'
import config from '../config'
import logger from './logger'
import { getIPAddress } from '../utils/common'

const env = process.env.NODE_ENV === 'dev' ? 'dev' : 'production'
const SERVICE_URI = {
  dev: 'http://sk.com/api/wechat/service-manager',
  production: 'https://sk.com/api/wechat/service-manager',
}[env]

let udid = null

// 将本服务的 IP 地址和端口号自动注册到设备管理服务上
export async function register() {
  const url = `${SERVICE_URI}/register`
  const ip = getIPAddress()
  try {
    const { data } = await axios.post(url, { ip, port: config.port })
    const { status, message } = data
    if (status !== 0) {
      throw new Error(message)
    }
    udid = data?.data?.id
    logger.debug(
      `[service-manager] successfully registered, ip: ${ip}, port: ${
        config.port
      }, response: ${JSON.stringify(data)}`
    )
  } catch (err: any) {
    logger.error(
      `[service-manager] failure to register, error message: ${err.message}`
    )
  }
}

// 告知设备管理服务，本服务为可用状态
export async function release() {
  if (!udid) {
    logger.error('[service-manager] failure to release, udid is empty')
    return
  }

  const url = `${SERVICE_URI}/release`
  try {
    const { data } = await axios.post(url, { id: udid })
    const { status, message } = data
    if (status !== 0) {
      throw new Error(message)
    }
    logger.debug(
      `[service-manager] successfully released, udid: ${udid}, response: ${JSON.stringify(
        data
      )}`
    )
  } catch (err: any) {
    logger.error(
      `[service-manager] failure to release, error message: ${err.message}`
    )
  }
}
