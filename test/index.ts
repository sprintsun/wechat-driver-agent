import { remote } from 'webdriverio'
import { slide, viewThePhotoAlbum } from './detail/photo'
import { searchMoreHotArea } from './home-page/search-more-hot-area'

const app =
  'http://domain.com/v1/mss_5d36254f5d7d4de5ad564fb3bb84682c/hfe-assets-st/hfe/awpserver-zip/1655882050149-91153212-7a0e-44c7-9612-7041d867bf64.zip'

const opts = {
  path: '/wd/hub',
  port: 4723,
  // https://appium.io/docs/en/writing-running-appium/caps/
  capabilities: {
    platformName: 'windows', // 安装小程序开发者工具主机的系统名称，理论上也支持 windows
    'appium:automationName': 'wechat', // 务必配置成"wechat"，appium server 才能使用自定义协议 appium-wechat-driver
    'appium:systemPort': '8080', // wechat-driver-agent 服务的端口号，默认为 10100
    'appium:systemHost': '10.5.212.240', // wechat-driver-agent 服务的 IP 地址，默认为 127.0.0.1
    // 'appium:systemHost': '127.0.0.1', // wechat-driver-agent 服务的 IP 地址，默认为 127.0.0.1
    'appium:showServerLogs': true,
    'appium:newCommandTimeout': 120, // How long (in seconds) Appium will wait for a new command from the client before assuming the client quit and ending the session, default 60
    // 'appium:appPath': '/Users/jiuhu/mini-app', // 小程序项目安装目录，不传默认为 ~/mini-app
    'appium:pagePath':
      '/pages/product/product?productId=5123688&poiId=188074393', // 小程序启动的页面路径，默认为 /pages/index/index
    'appium:app': app, // 小程序应用安装包地址，可以在 talos 发布日志中获取。该参数如果为空，则默认从 appium:appPath 配置的目录加载小程序项目
    // 'appium:mockUrl': 'http://172.25.132.198:53783', // mock server
    'appium:mpServerUrl': '172.25.132.198:8765', // mpServerUrl server
    'appium:ticket': 'xxx', // 微信登录账号ticket，可以通过curl --location --request GET 'http://10.31.145.145:8080/ticket'获取
    'appium:processArguments': {
      env: {
        env_urlScheme: '',
      },
    },
  },
}

async function wait() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null)
    }, 5000)
  })
}

async function loop(func, total) {
  if (total <= 0) {
    return
  }
  await func()
  console.log(`###执行1次，还剩余 ${total - 1} 次`)
  await wait()
  console.log(`###等待5s，继续下一次执行`)
  await loop(func, total - 1)
}

async function main() {
  // await viewThePhotoAlbum(client)
  // await searchMoreHotArea(client)
  const client = await remote(opts)
  await slide(client)

  // const list = Array.from(new Array(50)).map(() => searchMoreHotArea(client))
  // const func = async () => {
  //   // 创建连接
  //   const client = await remote(opts)
  //   await searchMoreHotArea(client)
  // }
  // await loop(func, 16)
  // console.log('###成功执行 16 次用例')
}

main()
