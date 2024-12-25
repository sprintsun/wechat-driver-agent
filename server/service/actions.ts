import globalState from './state'
import { ElementNotInteractableError } from '../utils/error'
import { findElementAttribute } from './element-state'
import logger from './logger'

const ACTION_TYPE = {
  PRESS: 'press',
  WAIT: 'wait',
  MOVE_TO: 'moveTo',
  RELEASE: 'release',
}

function getOffset(actions) {
  const startX = actions?.[0]?.options?.x ?? 0
  const endX = actions?.[2]?.options?.x ?? 0
  const startY = actions?.[0]?.options?.y ?? 0
  const endY = actions?.[2]?.options?.y ?? 0
  return { x: startX - endX, y: startY - endY }
}

export const perform = async function (params): Promise<void> {
  const { actions = [] } = params
  const elementId = actions?.[0]?.options?.element
  const { x, y } = getOffset(actions)
  if (x === 0 && y === 0) {
    return
  }
  if (elementId) {
    const element = globalState.getElement(elementId)
    if (element.scrollTo) {
      await element.scrollTo(x, y)
      logger.debug(`[touch perform] element scroll to x: ${x}, y: ${y}`)
    } else if (element.tagName === 'swiper') {
      const currentAttr = await findElementAttribute('current', elementId)
      const currentIndex = currentAttr ? Number(currentAttr) : 0
      const nextIndex = x > 0 ? currentIndex + 1 : currentIndex - 1
      if (nextIndex > 0) {
        await element.swipeTo(nextIndex)
        logger.debug(`[touch perform] element swipe to index: ${nextIndex}`)
      }
    } else {
      throw new ElementNotInteractableError()
    }
  } else {
    const miniProgram = globalState.getValue('miniProgram')
    await miniProgram.pageScrollTo(y)
  }

  return
}
