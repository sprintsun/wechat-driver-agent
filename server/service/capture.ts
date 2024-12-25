import globalState from './state'

export const screenshot = async function () {
  const miniProgram = globalState.getValue('miniProgram')
  const base64Image = await miniProgram.screenshot()
  return base64Image
}
