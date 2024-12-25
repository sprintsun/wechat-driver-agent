import { screenshot } from '../service/capture'
import { I_Controllers } from '../types'

export default [
  {
    path: '/session/:sessionId/screenshot',
    method: 'get',
    async controller() {
      const { sessionId } = this.params
      const value = await screenshot()
      return {
        sessionId,
        value,
      }
    },
  },
  {
    path: '/session/:sessionId/element/:elementId/screenshot',
    method: 'get',
    async controller() {
      const { sessionId, elementId } = this.params
      return {
        sessionId,
        value: null,
      }
    },
  },
] as I_Controllers[]
