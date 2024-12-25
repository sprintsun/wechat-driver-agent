import axios from 'axios'
import logger from './logger'

const MP_SERVER = 'https://lyrebird.sk.com/api/mptools/host'

// mockUrl 写入到小程序数据缓存 storage 中的 key
const STORAGE_KEY = 'auto_mock_url'

interface I_DeviceInfo {
  platform: string
  brand: string
  model: string
  system: string
}
export async function generateDeviceKey(miniProgram): Promise<string> {
  const systemInfo = await miniProgram.systemInfo()
  const accountInfo = await miniProgram.callWxMethod('getAccountInfoSync')
  const appId = accountInfo?.miniProgram?.appId ?? ''
  let deviceKey = [
    systemInfo.platform,
    systemInfo.brand,
    systemInfo.model,
    systemInfo.system,
    appId,
  ].join('--')
  return deviceKey
}

async function updateStorage(miniProgram, capabilities) {
  const mockUrl = capabilities?.mockUrl
  const method = mockUrl ? 'setStorage' : 'removeStorage'
  const options = mockUrl
    ? { key: STORAGE_KEY, data: mockUrl ?? '' }
    : { key: STORAGE_KEY }
  try {
    await miniProgram.callWxMethod(method, options)
    logger.debug(`[lyrebird] ${method} successfully`)
  } catch (err: any) {
    logger.error(`setStorage failed, error message: ${err.message}`)
    throw new Error('setStorage failed')
  }
}

async function register(deviceKey: string, url: string) {
  if (deviceKey && url) {
    const data = { device_key: deviceKey, url }
    logger.debug(`[lyrebird] mp server register data: ${JSON.stringify(data)}`)
    try {
      await axios.post(`${MP_SERVER}/register`, data)
    } catch (err: any) {
      logger.error(`mp server register failed, error message: ${err.message}`)
      throw new Error('mp server register failed')
    }
    logger.debug(`[lyrebird] update lyrebird config successfully`)
  }
}

export async function updateLyrebirdConfig(deviceKey: string, url: string) {
  // 1. 更新 storage 中 mockUrl 的值
  // 不需要传 mockUrl 的值了
  // await updateStorage(miniProgram, capabilities)

  // 2. 将 deviceKey 注册到 mp 服务
  await register(deviceKey, url)
}
