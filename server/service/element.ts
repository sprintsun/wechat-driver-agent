import globalState from './state'
import { NoSuchElementError, MiniprogramAutomatorError } from '../utils/error'
import { createSelector } from '../utils/common'
import logger from './logger'
import _ from 'lodash'
import Page from 'miniprogram-automator/out/Page'

interface I_Params {
  using: string
  value: string
}

// TODO: 增加单测
// 获取父元素
export async function getParentElement(elementId) {
  if (elementId) {
    const parentElement = globalState.getElement(elementId)
    if (!parentElement) {
      throw new Error(`elementId ${elementId} is not exists`)
    }
    return parentElement
  }
  return await globalState.getCurrentPage()
}

export const findElement = async function (
  params: I_Params,
  elementId?: string
) {
  const { using, value } = params
  const selector = createSelector(value, using)

  const beginTime = Date.now()
  const parentElement = await getParentElement(elementId)
  let element
  try {
    element = await findElementBySelector(parentElement, selector, false)
  } catch (err: any) {
    throw new MiniprogramAutomatorError(`findElement error: ${err.message}`)
  }

  if (Date.now() - beginTime > 30 * 1000) {
    logger.warn(
      `[miniprogram automator] findElement timeout, element: ${elementId}, selector: ${selector}`
    )
  }

  if (element?.id) {
    globalState.setElement(element.id, element)
    logger.debug(
      `[miniprogram automator] findElement successfully, selector: ${selector}, elementId: ${element.id}`
    )
    return {
      ELEMENT: element.id,
    }
  }

  throw new NoSuchElementError()
}

export const findElements = async function (
  params: I_Params,
  elementId?: string
) {
  const { using, value } = params
  const selector = createSelector(value, using)

  const parentElement = await getParentElement(elementId)
  let elements
  try {
    elements = await findElementBySelector(parentElement, selector)
  } catch (err: any) {
    throw new MiniprogramAutomatorError(`findElements error: ${err.message}`)
  }

  if (elements?.length) {
    logger.debug(
      `[miniprogram automator] findElements successfully, selector: ${selector}, elements: ${JSON.stringify(
        elements.map((item) => item.id)
      )}`
    )
    return elements.map((item) => {
      globalState.setElement(item.id, item)
      return { ELEMENT: item.id }
    })
  }
  throw new NoSuchElementError()
}

/**
 * 通过 selector 查找元素
 * 
 * 通过向 miniprogram-automator 的 page 对象传入 selector, 以获取该 page 对象按此选择器筛选结果的子节点
 * 
 */
const findElementBySelector = async function (page: Page, selector, isElements = true) {
  
  // >>> 非组合查找 <<<
  // 直接返回 await Page.$/$$(selector) 的查找结果
  if (!_.isArray(selector)){
    if (isElements) {
      return await page.$$(selector);
    }
    return await page.$(selector);
  }

  /**
   * >>> 组合查找 <<<
   * 
   * 组合查找是通过一组选择器, 来精准定位某个路径下的元素子节点.
   * 如通过: [".a", "#b", ".btn"] 可定位如下示例中的提交按钮
   * ```
   *  <div class="a">
   *    <div id="b">
   *      <button class="btn">提交按钮</button>
   *    </div>
   *  </div>
   * ```
   * 
   */
  let currentPage = page;
  logger.debug(`[miniprogram automator]: combinators selector use: ${selector}`)

  for (const index in selector) {
    /**
     * >>> 组合查找 - [多并集选择器节点] <<<
     * 
     * 组合查找中的多并集选择器是一种特殊的组合查找方式
     * 
     * 一般在组合查找器中, 每个节点只会有一种查找条件, 如: ["a", ".b", "#c"]
     * 但[多并集选择器节点]中, 该节点会存在多个查询条件 (通过","连接) , 如: ["a", ".b", "#c, .d"]
     * 
     * 它表示: 在通过 "a", ".b" 查找到 ".b" 所在节点后, 需要同时查找 "#c" 与 ".d"的结果, 并取结果并集
     */
    if (selector[index].includes(',')) {
      logger.debug(`[miniprogram automator]: [${index}/${selector.length}] use union selectors: ${selector[index]}`)
      
      let unionTempResult: Page[] = []
      
      // 将 [".a?1, #b, c"] 拆分为 [[".a?1", "#b", "c"]]
      const unionSelectors = selector[index].split(',').filter(Boolean).map(selector => {return selector.trim()})
      
      for (const unionSelector of unionSelectors) {
        // 处理组合查找器中带索引的部分
        if (unionSelector.includes('?')) {
          // 组合选择器带有索引下标时, 按照 "?" 获取其下标
          // 并通过 page.$$(selector)[index] 获取元素结果
        
          // CSS Selector 语法: 在 selector index 中从1开始计数，所以在查找 page 对象时需要 -1, 从 0 获取列表索引
          const selectorIndex = parseInt(unionSelector.split('?')[1]) - 1
          const selectorName = unionSelector.split('?')[0]
          let currentUnionSelectorResult
          try {
            currentUnionSelectorResult = await findChainSelectorIndexElement(currentPage, selectorName, selectorIndex)
          } catch (error: any) {
            logger.debug(`[miniprogram automator] find element use union selector: ${unionSelector} failed: ${error.message}`)
          }
          if (currentUnionSelectorResult) {
            unionTempResult = _.union(unionTempResult, [currentUnionSelectorResult])
          }
        }
        // 与并集选择器其他结果取并集
        try {
          const currentUnionSelectorResult = await findChainSelectorElement(currentPage, unionSelector)
          if (currentUnionSelectorResult) {
            unionTempResult = _.union(unionTempResult, [currentUnionSelectorResult])
          }
        } catch (error: any) {
          logger.debug(`[miniprogram automator] find element use union selector: ${unionSelector} failed: ${error.message}`)
        }
      }
      // 多并集选择器在组合选择器中使用时, 返回若结果并集查找结果不唯一, 则需要在此主动抛出异常, 阻塞后续查找
      if (unionTempResult.length !== 1) {
        throw new MiniprogramAutomatorError(`[miniprogram automator]: union selector: ${selector[index]} result index error! expect results: 1, actural results: ${unionTempResult.length}`)
      }
      currentPage = unionTempResult[0]
      continue
    }

    // >>> 组合查找 - [带索引的组合选择器] <<<
    else if (selector[index].includes('?')) {
      logger.debug(`[miniprogram automator]: [${index}/${selector.length}] use index combinators selectors: ${selector[index]}`)

      // CSS Selector 语法: 在 selector index 中从1开始计数，所以在查找 page 对象时需要 -1, 从 0 获取列表索引
      const selectorIndex = parseInt(selector[index].split('?')[1]) - 1
      const selectorName = selector[index].split('?')[0]
      currentPage = await findChainSelectorIndexElement(currentPage, selectorName, selectorIndex)
    }

    // >>> 组合查找 - [不带索引的组合选择器] <<<
    else {
      logger.debug(`[miniprogram automator]: [${index}/${selector.length}] use no index combinators selectors: ${selector[index]}`)
      currentPage = await findChainSelectorElement(currentPage, selector[index])
    }
  }

  return isElements ? [currentPage] : currentPage
}

const findChainSelectorElement = async function (currentPage: Page, selector: string) {
  return findChainSelectorIndexElement(currentPage, selector, 0)
}

const findChainSelectorIndexElement = async function (currentPage: Page, selector: string, selectorIndex: number) {
  logger.debug(`[miniprogram automator]: find elements by selectors: ${selector}, index: ${selectorIndex}`)

  let currentElement
  if (selectorIndex === 0) {
    currentElement = await currentPage!.$(selector)
  } else {
    let currentElements = await currentPage!.$$(selector)
    logger.debug(`currentElements length: ${currentElements!.length}`)
    currentElement = currentElements[selectorIndex]
  }
  if (!currentElement) {
    throw new MiniprogramAutomatorError(`Can not find any element by: ${selector} `)
  }

  logger.debug(`[miniprogram automator] 
    current page id: ${await currentElement?.attribute('id')} \n
    current page class: ${await currentElement?.attribute('class')} \n
    current page text: ${await currentElement?.text()} \n
    current page WXML: ${await currentElement?.wxml()} \n
  `)

  return currentElement
}
