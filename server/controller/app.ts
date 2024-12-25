import { installApp } from '../service/app'
import { I_Controllers } from '../types'

export default [
  {
    path: '/session/:sessionId/appium/device/install_app',
    method: 'post',
    async controller() {
      const { sessionId } = this.params
      const params = this.request.body || {}
      await installApp(params)
      return { sessionId, value: null }
    },
  },
] as I_Controllers[]
