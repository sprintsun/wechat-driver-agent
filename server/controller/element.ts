import { findElement, findElements } from '../service/element'
import { I_Controllers } from '../types'

export default [
  {
    path: '/session/:sessionId/element',
    method: 'post',
    async controller() {
      const params = this.request.body || {}
      const { sessionId } = this.params
      const value = await findElement(params)
      if (value) {
        return {
          sessionId,
          value,
        }
      }
      return null
    },
  },
  {
    path: '/session/:sessionId/elements',
    method: 'post',
    async controller() {
      const params = this.request.body || {}
      const { sessionId } = this.params
      const value = await findElements(params)
      if (value) {
        return {
          sessionId,
          value,
        }
      }
      return null
    },
  },
  {
    path: '/session/:sessionId/element/:elementId/element',
    method: 'post',
    async controller() {
      const params = this.request.body || {}
      const { sessionId, elementId } = this.params
      const value = await findElement(params, elementId)
      if (value) {
        return {
          sessionId,
          value,
        }
      }
      return null
    },
  },
  {
    path: '/session/:sessionId/element/:elementId/elements',
    method: 'post',
    async controller() {
      const params = this.request.body || {}
      const { sessionId, elementId } = this.params
      const value = await findElements(params, elementId)
      if (value) {
        return {
          sessionId,
          value,
        }
      }
      return null
    },
  },
] as I_Controllers[]
