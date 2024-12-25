import globalState from './state'
import { getParentElement } from './element'

export const findElementText = async function (elementId) {
  const parentElement = await getParentElement(elementId)
  const text = await parentElement.text()
  return text || null
}

export const findElementAttribute = async function (attrName, elementId) {
  const parentElement = await getParentElement(elementId)
  const attr = await parentElement.attribute(attrName)
  return attr || null
}

export const findElementProperty = async function (attrName, elementId) {
  const parentElement = await getParentElement(elementId)
  const prop = await parentElement.property(attrName)
  return prop || null
}

export const getElementLocation = async function (elementId) {
  const parentElement = await getParentElement(elementId)
  const { left, top } = await parentElement.offset()
  return { x: left, y: top }
}

export const getElementSize = async function (elementId) {
  const parentElement = await getParentElement(elementId)
  const { width, height } = await parentElement.size()
  return { width, height }
}

export const getElementDisplayed = async function (elementId) {
  const parentElement = globalState.getElement(elementId)
  if (!parentElement) {
    return false
  }

  const currentPage = await globalState.getCurrentPage()
  return parentElement.pageId === currentPage.id
}
