// const automator = require("miniprogram-automator");
const wdio = require('webdriverio')

const opts = {
  path: '/wd/hub',
  port: 4723,
  // https://appium.io/docs/en/writing-running-appium/caps/
  capabilities: {
    platformName: 'mac', // 安装小程序开发者工具主机的系统名称，理论上也支持 windows
    'appium:automationName': 'wechat', // 务必配置成"wechat"，appium server 才能使用自定义协议 appium-wechat-driver
    'appium:systemPort': '8080', // wechat-driver-agent 服务的端口号，默认为 10100
    'appium:systemHost': '127.0.0.1', // wechat-driver-agent 服务的 IP 地址，默认为 127.0.0.1
    'appium:showServerLogs': true,
    'appium:newCommandTimeout': 120, // How long (in seconds) Appium will wait for a new command from the client before assuming the client quit and ending the session, default 60
    'appium:projectName': 'phx-miniapp', // 小程序项目名，如果下面的 appium:appPath 有配置，可以不传该参数
    'appium:appPath': '/Users/jiuhu/work/phx-miniapp/dist', // 小程序项目构建后 dist 文件的目录，默认为 ~/miniapp/[appium:projectName]/dist
    'appium:pagePath': '/pages/index/index', // 小程序启动的页面路径，默认为 /pages/index/index
  },
}

const repoUrl =
  'https://sk.com/code/repo-detail/fe/wrap/file/list?branch=refs%2Fheads%2Fpublish-5.19.50-1628587895021'

async function main() {
  // 创建连接
  const client = await wdio.remote(opts)

  // client.addCommand("buildMiniApp", async (res) => {
  //   console.log("###buildMiniApp res", res);
  // });
  // client.buildMiniApp({ appName: "test123" });
  // Use Accessibility ID Selector https://webdriver.io/docs/selectors/#accessibility-id

  // 安装应用
  const app = await client.installApp(repoUrl)
  console.log('###app', app)

  // 获取 context
  const context = await client.getContext()
  console.log('###context', context)

  // 获取页面 size
  const pageSize = await client.getWindowRect()
  console.log('###pageSize', pageSize)

  // 向下滚动 100 px
  const container = await client.$('~99C980241D1B2C9A')
  const scrollView = await container.$('<scroll-view />')

  await scrollView.touchAction([
    { action: 'press', x: 187, y: 100 },
    { action: 'wait', ms: 1000 },
    { action: 'moveTo', x: 187, y: 0 },
    'release',
  ])

  // 根据 accessibility id 选择器查找元素
  const searchButton = await client.$('~E8FA617C109DB7B3')

  // 获取元素 displayed 属性
  const displayed1 = await searchButton.isDisplayed()
  const displayed2 = await searchButton.waitForDisplayed()
  console.log('###attribute displayed:', displayed1)
  console.log('###waitForDisplayed:', displayed2)

  // 获取元素 size
  const size = await client.getElementSize(searchButton.elementId)
  console.log('###searchButton size:', size)

  // 获取元素 text
  const text = await searchButton.getText()
  if (text && text.trim() === '查找民宿') {
    console.log('###点击查找民宿按钮')
    // 点击元素
    await searchButton.click()
  }
  // await client.deleteSession();
}

main()
