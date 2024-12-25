import globalState from './state'

export const getWindowSize = async function (windowHandle) {
  if (windowHandle === 'current') {
    const miniProgram = globalState.getValue('miniProgram')
    const currentPage = await miniProgram.currentPage()
    const pageSize = await currentPage.size()
    return pageSize
  }
  // TODO: 非当前窗口的获取暂不处理
  return null
}
