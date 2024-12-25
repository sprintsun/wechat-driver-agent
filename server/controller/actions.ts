import { perform } from '../service/actions'
import { I_Controllers } from '../types'

export default [
  {
    path: '/session/:sessionId/touch/perform',
    method: 'post',
    async controller() {
      const params = this.request.body || {}
      const { sessionId } = this.params
      await perform(params)
      return {
        sessionId,
        value: null,
      }
    },
  },
] as I_Controllers[]
