import { I_Controllers } from '../types'

export default [
  {
    path: '/session/:sessionId/log',
    method: 'post',
    async controller() {
      // TODO: 返回 wechat-driver-agent 的日志，后续再完善，需要确认以什么格式返回多少日志信息
      const { sessionId } = this.params
      return {
        sessionId,
        value: [],
      }
    },
  },
] as I_Controllers[]
