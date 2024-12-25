import os from 'os'
import shell from 'shelljs'
import logger from '../service/logger'

const USING = {
  CSS_SELECTOR: 'css selector',
  ACCESSIBILITY_ID: 'accessibility id',
  TAG_NAME: 'tag name',
  NAME: 'name',
  CLASS_NAME: 'class name',
  CHAIN_SELECTOR: 'selector'
}

// 选择器：https://segmentfault.com/a/1190000017582162
// 支持 CSS3 选择器：https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Selectors
export function createSelector(value, using) {
  switch (using) {
    case USING.ACCESSIBILITY_ID:
      return `[data-accessibilitylabel="${value}"]`
    case USING.CSS_SELECTOR:
      return getFormattedChainSelector(value)
    case USING.CLASS_NAME:
      return `.${value}`
    case USING.TAG_NAME:
      return `${value}`
    case USING.NAME:
      return `[name=${value}]`
    default:
      return `${value}`
  }
}

/**
 * 获取格式化的组合选择器
 * 
 * >>> 详见: https://sk.com/page/1301698865
 * 
 * <h1>什么是组合选择器</h1>
 * 除 CSS Selector 基础选择器外, 组合选择器还支持: 
 *  - "子代选择器(firstChildSelector)": .a > #b (以 “>” 连接)
 *  - "后代选择器(nthChildSelector)": .a   #b (以 “ ” 连接)
 *  - "跨自定义组件后代选择器(customNthChildSelector)" 支持微信小程序自定义组件 #shadow-root: .a >>> #b (以 “>>>” 连接)
 *  - "多并集选择器": 同一个节点可以传入多个选择器, 取结果并集: #a-node,.some-other-nodes( (以 “,” 连接))
 * 同时, 每种选择器直接还支持通过索引查找: .a[1] > #b[2] (与CSS Selector相同, index=1作为索引起点)
 * 
 * <h1>组合选择器如何查找元素</h1>
 * 由于Wechat-driver-agent是通过miniprogram-automator实现元素查找的，所以需要将链式选择器，
 * 格式化成为 miniprogram.page 对象所能查找的选择器列表。
 * 如: .a > b > #c d > .e[1]  格式化为: [".a", "b", "#c", "d", "e~1"]
 *  - 其中无索引的selector通过 await page.$(selectors) 查找
 *  - 其中有索引的selector通过 await page.$$(selectors) 查找
 */
export function getFormattedChainSelector(chainSelector: string): string[] {
  // 拆分 "跨自定义组件后代选择器(customNthChildSelector)" .a >>> #b 拆分为 [".a", "#b"]
  const formatCustomNthChildSelector = chainSelector.split('>>>').filter(Boolean).map(selector => {return selector.trim()})

  // 拆分 "子代选择器(firstChildSelector)" .a > #b 拆分为 [".a", "#b"]
  const formatFirstChildSelector: string[] = []
  for (const selector of formatCustomNthChildSelector) {
    if (selector.includes('>')) {
      const firstChildSelectorSpilt = selector.split('>').filter(Boolean).map(item => {return item.trim()})
      for (const firstChildItem of firstChildSelectorSpilt) {
        formatFirstChildSelector.push(firstChildItem)
      }
      continue
    }
    formatFirstChildSelector.push(selector)
  }

  // 拆分 "后代选择器(nthChildSelector)" .a #b 拆分为 [".a", "#b"]
  const formatNthChildSelector: string[] = []
  for (const selector of formatFirstChildSelector) {
    if (selector.includes(' ')) {
      const nthChildSelectorSpilt = selector.split(' ').filter(Boolean).map(item => {return item.trim()})
      for (const nthChildItem of nthChildSelectorSpilt) {
        formatNthChildSelector.push(nthChildItem)
      }
      continue
    }
    formatNthChildSelector.push(selector)
  }

  // 拆分筛选项索引, 由 ["a[1]", b[2]] 修改为 ["a?1", "b?2"]
  const resultChainSelectors: string[] = []
  for (const selector of formatNthChildSelector) {
    if (selector.includes("[") && selector.includes("]")) {
      resultChainSelectors.push(`${selector.split("[")[0]}?${selector.split("[")[1].split("]")[0]}`)
      continue
    }
    resultChainSelectors.push(selector)
  }

  return resultChainSelectors
}

export function getIPAddress() {
  let address = ''
  const interfaces = os.networkInterfaces()
  Object.keys(interfaces).forEach((key) => {
    interfaces[key]?.forEach((alias) => {
      if (
        alias.family === 'IPv4' &&
        alias.address !== '127.0.0.1' &&
        !alias.internal
      ) {
        address = alias.address
      }
    })
  })
  return address
}

export async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), ms)
  })
}

// 查询微信开发者工具的 PID
export function getPIDOfWechatDevTools() {
  const res = shell.exec(
    `ps -ef | awk '/[w]echatwebdevtools.app\\/Contents\\/MacOS\\/wechatdevtools/{print $2}'`
  ).stdout
  const pid = res.trim()
  logger.debug(`[shell] getPIDOfWechatDevTools, pid: ${pid || null}`)
  return pid
}

export async function killProcess() {
  const pid = getPIDOfWechatDevTools()
  if (!pid) {
    logger.warn(`[shell] unable to kill process, because pid is null`)
    return
  }
  const res = shell.exec(`kill -9 ${pid}`)
  if (res.code !== 0) {
    logger.error(
      `[shell] unable to kill process, pid: ${pid}, err: ${res.stderr}`
    )
    return
  }
  logger.debug('[shell] waiting to kill process')
  await wait(15000)
  logger.info(`[shell] the process has been successfully killed, pid: ${pid}`)
}
