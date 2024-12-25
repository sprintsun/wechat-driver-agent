import globalState from './state'
import logger from './logger'

export const getPageSource = async function () {
  const miniProgram = globalState.getValue('miniProgram')
  const currentPage = await miniProgram.currentPage()
  const rootElement = await currentPage.$('page')
  const pageSource = await rootElement.outerWxml()
  logger.debug(
    `[getPageSource] get page source successfully, source length: ${pageSource.length}`
  )
  return pageSource
}
