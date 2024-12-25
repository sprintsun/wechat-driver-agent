import { getWindowSize } from '../service/window'
import { I_Controllers } from '../types'

export default [
  {
    path: '/session/:sessionId/window/:windowHandle/size',
    method: 'get',
    async controller() {
      const { sessionId, windowHandle } = this.params
      const value = await getWindowSize(windowHandle)
      return {
        sessionId,
        value,
      }
    },
  },
] as I_Controllers[]
