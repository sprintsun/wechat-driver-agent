import { getNewTicket } from '../service/ticket'
import { I_Controllers } from '../types'

export default [
  {
    // CustomCommand: [Get Ticket]
    path: '/ticket',
    method: 'get',
    async controller() {
      const params = this.request.body || {}
      const ticket = await getNewTicket(params)
      return {
        sessionId: null,
        value: ticket,
      }
    },
  },
] as I_Controllers[]
