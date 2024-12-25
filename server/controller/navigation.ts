import { back, navigateTo, refresh, getCurrentUrl } from '../service/navigation'
import { I_Controllers } from '../types'

export default [
  {
    // Command: [back](https://w3c.github.io/webdriver/#back)
    path: '/session/:sessionId/back',
    method: 'post',
    async controller() {
      const { sessionId } = this.params
      await back()
      return {
        sessionId,
        value: null,
      }
    },
  },
  {
    // Command: [navigateTo](https://w3c.github.io/webdriver/#navigate-to)
    path: '/session/:sessionId/url',
    method: 'post',
    async controller() {
      const { sessionId } = this.params
      const params = this.request.body
      await navigateTo(params?.url)
      return {
        sessionId,
        value: null,
      }
    },
  },
  {
    // Command: [Refresh](https://w3c.github.io/webdriver/#refresh)
    path: '/session/:sessionId/refresh',
    method: 'post',
    async controller() {
      const { sessionId } = this.params
      await refresh()
      return {
        sessionId,
        value: null,
      }
    },
  },
  {
    // Command: [GetCurrentURL](https://w3c.github.io/webdriver/#get-current-url)
    path: '/session/:sessionId/url',
    method: 'get',
    async controller() {
      const { sessionId } = this.params
      const value = await getCurrentUrl()
      return {
        sessionId,
        value,
      }
    },
  },
] as I_Controllers[]
