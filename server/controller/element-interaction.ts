import { click, setValue, clear } from '../service/element-interaction'
import { I_Controllers } from '../types'

export default [
  {
    path: '/session/:sessionId/element/:elementId/click',
    method: 'post',
    async controller() {
      const { sessionId, elementId } = this.params
      await click(elementId)
      return {
        sessionId,
        value: null,
      }
    },
  },
  {
    // Command: [setValue](https://w3c.github.io/webdriver/#dfn-element-send-keys)
    path: '/session/:sessionId/element/:elementId/value',
    method: 'post',
    async controller() {
      const params = this.request?.body || {}
      const { sessionId, elementId } = this.params
      await setValue(elementId, params)
      return {
        sessionId,
        value: null,
      }
    },
  },
  {
    // Command: [clear](https://w3c.github.io/webdriver/#element-clear)
    path: '/session/:sessionId/element/:elementId/clear',
    method: 'post',
    async controller() {
      const { sessionId, elementId } = this.params
      await clear(elementId)
      return {
        sessionId,
        value: null,
      }
    },
  },
] as I_Controllers[]
