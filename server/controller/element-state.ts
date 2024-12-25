import {
  findElementText,
  findElementAttribute,
  findElementProperty,
  getElementLocation,
  getElementSize,
  getElementDisplayed,
} from '../service/element-state'
import { I_Controllers } from '../types'

export default [
  {
    path: '/session/:sessionId/element/:elementId/text',
    method: 'get',
    async controller() {
      const { sessionId, elementId } = this.params
      const value = await findElementText(elementId)
      return {
        sessionId,
        value,
      }
    },
  },
  {
    path: '/session/:sessionId/element/:elementId/property/:propName',
    method: 'get',
    async controller() {
      const { sessionId, elementId, propName } = this.params
      const value = await findElementProperty(propName, elementId)
      return {
        sessionId,
        value,
      }
    },
  },
  {
    path: '/session/:sessionId/element/:elementId/attribute/:attrName',
    method: 'get',
    async controller() {
      const { sessionId, elementId, attrName } = this.params
      const value = await findElementAttribute(attrName, elementId)
      return {
        sessionId,
        value,
      }
    },
  },
  {
    path: '/session/:sessionId/element/:elementId/displayed',
    method: 'get',
    async controller() {
      const { sessionId, elementId } = this.params
      const value = await getElementDisplayed(elementId)
      return {
        sessionId,
        value,
      }
    },
  },
  {
    path: '/session/:sessionId/element/:elementId/location',
    method: 'get',
    async controller() {
      const { sessionId, elementId } = this.params
      const value = await getElementLocation(elementId)
      return {
        sessionId,
        value,
      }
    },
  },
  {
    path: '/session/:sessionId/element/:elementId/rect',
    method: 'get',
    async controller() {
      const { sessionId, elementId } = this.params
      const location = await getElementLocation(elementId)
      const size = await getElementSize(elementId)
      return {
        sessionId,
        value: { ...location, ...size },
      }
    },
  },
  {
    path: '/session/:sessionId/element/:elementId/size',
    method: 'get',
    async controller() {
      const { sessionId, elementId } = this.params
      const value = await getElementSize(elementId)
      return {
        sessionId,
        value,
      }
    },
  },
] as I_Controllers[]
