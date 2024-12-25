import { relogin, isLoginOfWechatDevTools } from '../service/login'
import { I_Controllers } from '../types'

export default [
  {
    path: '/alive',
    method: 'get',
    log: false,
    async controller() {
      return null
    },
  },
  {
    path: '/isLogin',
    method: 'get',
    async controller() {
      const isLogin = await isLoginOfWechatDevTools()
      return { isLogin }
    },
  },
  {
    path: '/relogin',
    method: 'get',
    async controller() {
      const qrcode = await relogin()
      this.type = 'image/jpeg'
      this.body = qrcode
    },
  },
  {
    path: /\/[^.]*/,
    async controller() {
      return {
        status: 200,
      }
    },
  },
] as I_Controllers[]
