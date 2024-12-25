import { createSession, getSession, deleteSession } from '../service/session'
import { I_Controllers } from '../types'

export default [
  {
    // Command: [New Session](https://w3c.github.io/webdriver/#dfn-new-sessions)
    path: '/session',
    method: 'post',
    async controller() {
      const params = this.request.body || {}
      await createSession(params)
      return {
        sessionId: params.sessionId,
        value: params.capabilities,
      }
    },
  },
  {
    // Command: [Get Session](https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#sessionsessionid)
    path: '/session/:sessionId',
    method: 'get',
    async controller() {
      const { sessionId } = this.params
      const value = await getSession()
      return {
        sessionId,
        value,
      }
    },
  },
  {
    // Command: [Delete Session](https://w3c.github.io/webdriver/#delete-session)
    path: '/session/:sessionId',
    method: 'delete',
    async controller() {
      const { sessionId } = this.params
      await deleteSession(sessionId)
      return {
        sessionId,
        value: null,
      }
    },
  },
  {
    // Command: [Status](https://w3c.github.io/webdriver/#dfn-status)
    path: '/status',
    method: 'get',
    async controller() {
      return {
        sessionId: 'None',
        value: {
          ready: true,
          message: 'Custom Wechat Devtools Server is ready to accept commands',
        },
      }
    },
  },
] as I_Controllers[]
