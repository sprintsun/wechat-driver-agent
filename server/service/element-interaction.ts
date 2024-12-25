import { UnsupportedOperationError } from '../utils/error'
import { getParentElement } from './element'

// 通过trigger confirm，可以实现回车输入，keywordInput.trigger('confirm', { value: '12345' })

export const click = async function (elementId) {
  const parentElement = await getParentElement(elementId)
  await parentElement.tap()
}

export const setValue = async function (elementId: string, params: any) {
  const parentElement = await getParentElement(elementId)
  /**
   * 选择picker-view方法
   * 本地调用sendKeys传入形如如下格式字符串
   * “0”   或  “0,1,2”
   * 数组中的数字依次表示 picker-view 内的 picker-view-colume 选择的第几项（下标从 0 开始）
   */
  if (parentElement.tagName === 'picker-view') {
    try {
      let valueNumList: number[] = params.text.split(",").map(value => Number(value))
      await parentElement.trigger('change', { value: valueNumList })
    } catch (err: any) {
      throw new UnsupportedOperationError(err.message)
    }
  } else {
    try {
      await parentElement.input(params.text)
    } catch (err: any) {
      throw new UnsupportedOperationError(err.message)
    }
  }
}

export const clear = async function (elementId: string) {
  const parentElement = await getParentElement(elementId)
  try {
    await parentElement.input('')
  } catch (err: any) {
    throw new UnsupportedOperationError(err.message)
  }
}
