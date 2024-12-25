import { getPageSource } from '../service/document'
import { I_Controllers } from '../types'

export default [
  {
    // Command: [Get Page Source](https://w3c.github.io/webdriver/#get-page-source)
    path: '/session/:sessionId/source',
    method: 'get',
    async controller() {
      const { sessionId } = this.params
      const value = await getPageSource()
      return {
        sessionId,
        value,
      }
    },
  },
] as I_Controllers[]
