// import os from 'os'
import shell from 'shelljs'
import logger from './logger'
import { wait } from '../utils/common'

// mac 上微信开发者工具 cli 地址，windows上地址会不一样，后续有需要再兼容处理
// cli 命令使用手册：https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html
const CLI_PATH = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'

// 获取微信开发者工具登录二维码
export async function getLoginQRCodeOfWechatDevTools(): Promise<string> {
  // const userInfo = os.userInfo()
  // const outputPath = `/Users/${userInfo.username}/shortlink/code.txt`
  const cmd = `${CLI_PATH} login -f base64`
  const child = shell.exec(cmd, { async: true, silent: true })
  let base64 = ''
  child.stdout.on('data', function (data) {
    base64 += data
  })
  // child.stdout.on('end', function () {
  //   console.log('##### end')
  // })
  // child.stdout.on('close', function () {
  //   console.log('##### close')
  // })
  // 因为 stdout 不会触发 end 和 close 事件，shell 进程会挂起等待用户来扫码，所以只能暂时用等待 3s 来处理
  await wait(3000)
  return base64.trim().replace('data:image/jpeg;base64,', '')
}

export function isLoginOfWechatDevTools() {
  const stdout = shell.exec(`${CLI_PATH} islogin`).stdout
  const res = JSON.parse(stdout)
  const isLogin = res.login
  logger.debug(`isLogin of wechatDevTools: ${isLogin}`)
  return isLogin
}

export const relogin = async function (): Promise<Buffer> {
  const qrcode = await getLoginQRCodeOfWechatDevTools()
  return Buffer.from(qrcode, 'base64')
}
