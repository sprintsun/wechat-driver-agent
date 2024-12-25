const DEFAULT_PAGE_PATH = '/pages/index/index'

const DEFAULT_DATA = [
  ['sessionId', null],
  ['miniProgram', null],
  ['elements', {}],
  [
    'config',
    {
      pagePath: DEFAULT_PAGE_PATH,
      appPath: '',
    },
  ],
] as any

class State {
  private data: Map<string, any>

  public constructor() {
    this.data = new Map<string, any>(DEFAULT_DATA)
  }

  public reset() {
    this.data = new Map(DEFAULT_DATA)
  }

  public getValue(key) {
    return this.data.get(key) || null
  }

  public setValue(key, value) {
    this.data.set(key, value)
  }

  public async getCurrentPage() {
    const miniProgram = this.data.get('miniProgram')
    if (miniProgram) {
      return await miniProgram.currentPage()
    }
    return null
  }

  public getElement(key) {
    const elements = this.data.get('elements')
    return elements[key]
  }

  public setElement(key, value) {
    const elements = this.data.get('elements')
    this.data.set('elements', { ...elements, [key]: value })
  }

  public getConfig(key) {
    const config = this.data.get('config')
    return config[key]
  }

  public setConfig(key, value) {
    const config = this.data.get('config')
    this.data.set('config', { ...config, [key]: value })
  }
}

const singletonState = new State()

export default singletonState
