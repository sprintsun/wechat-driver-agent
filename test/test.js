const automator = require('miniprogram-automator')

async function init() {
  let miniProgram
  try {
    // 如果无法启动开发者工具，卡在 launch 这一步，请检查微信开发者工具设置 - 安全设置中，是否打开了“服务端口”选项
    miniProgram = await automator.launch({
      projectPath: '/Users/jiuhu/shortlink/mini-app/build',
      projectConfig: {
        libVersion: '2.20.0', // 项目中默认为"2.10.4"，因为 lyrebird 中使用一些比较新的 API，所以这里必须改为较新的"2.20.0"才能够运行应用
      },
    })
  } catch (err) {
    console.error(
      `[create session] unable to launch miniProgram devtools, trying to kill process`
    )
    // await killProcess()
    throw new Error('miniProgram devtools launch failed')
  }

  await miniProgram.close()

  // 启动主账号
  // const page = await miniProgram.reLaunch('/pages/index/index')
  // await page.waitFor('page')
  // await setKeyword(miniProgram, page)
}

async function setKeyword(miniProgram, page) {
  try {
    // const keywordView = await page.$(
    //   'view[data-accessibilitylabel$="AFA53B733041F6DF"]'
    // )
    // keywordView.tap()

    await page.waitFor(2000)
    console.log('###调用 miniProgram.close() 手动关闭')

    await miniProgram.close()
    // const currentPage = await miniProgram.currentPage()

    // const keywordInput = await currentPage.$('input[name=keyword]')
    // keywordInput.input('中山路')
    // console.log('###搜索关键字设置为【中山路】')

    // await keywordInput.trigger('confirm', { value: '12345' })
    // console.log('###trigger confirm 12345')
  } catch (e) {
    console.log('###element not exist!', e)
  }
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
  const func = async () => {
    await init()
  }
  await loop(func, 2)
  console.log('###成功执行 2 次用例')
}

main()
