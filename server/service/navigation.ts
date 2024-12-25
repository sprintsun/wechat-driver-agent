import globalState from './state'
import { NoSuchWindowError, InvalidArgumentError } from '../utils/error'
import Page from 'miniprogram-automator/out/Page'
import qs from 'querystring'
import logger from './logger'

export const back = async function () {
  const miniProgram = globalState.getValue('miniProgram')
  try {
    await miniProgram.navigateBack()
  } catch (err: any) {
    throw new NoSuchWindowError(err.message)
  }
}

export const refresh = async function () {
  const miniProgram = globalState.getValue('miniProgram')
  const currentPageurl = await getCurrentUrl()
  logger.info(`[navigation] refresh url: ${currentPageurl}`)
  try {
    await miniProgram.reLaunch(currentPageurl)
  } catch (err: any) {
    throw new NoSuchWindowError(err.message)
  }
}

export const redirectTo = async function (url: string) {
  if (!url) {
    throw new InvalidArgumentError()
  }
  const miniProgram = globalState.getValue('miniProgram')
  try {
    await miniProgram.redirectTo(url)
  } catch (err: any) {
    throw new NoSuchWindowError(err.message)
  }
}

export const navigateTo = async function (url: string) {
  if (!url) {
    throw new InvalidArgumentError()
  }
  const miniProgram = globalState.getValue('miniProgram')
  try {
    await miniProgram.navigateTo(url)
  } catch (err: any) {
    throw new NoSuchWindowError(err.message)
  }
}

export const getCurrentUrl = async function () {
  const page = await globalState.getCurrentPage()
  return getPageUrlFromPageObject(page)
}

const getPageUrlFromPageObject = function (page: Page) {
  const path = page.path
  const query = page.query
  let queryString = qs.encode(query)
  let url = '/' + path
  url += queryString === '' ? '' : `?${queryString}`
  return url
}
