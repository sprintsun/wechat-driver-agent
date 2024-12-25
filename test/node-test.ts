import automator from 'miniprogram-automator'

// function tapFirstItem() {
//   automator
//     .launch({
//       projectPath: "../wrap/dist", // 项目文件地址
//     })
//     // .connect({
//     //   wsEndpoint: "ws://localhost:9420",
//     // })
//     .then(async (miniProgram) => {
//       const page = await miniProgram.reLaunch(
//         "/zg/subpackage/dynamic-page/index?case=subpackage-old-products-products&cityId=310100"
//       );
//       await page.waitFor(3000);
//       try {
//         const roomCard = await page.$("room-card");
//         const imageView = await roomCard.$(".phx-img");
//         console.log("###imageView", await imageView.attribute("is"));
//         imageView.tap();
//         // console.log("###imageView length", imageView.length);
//         // const linearGradientContainer = await searchView.$$(
//         //   ".linearGradient-container"
//         // );
//         // console.log("###length", linearGradientContainer.length);
//         // for (let i = 0; i < linearGradientContainer.length; i++) {
//         //   const view = await linearGradientContainer[i].$("view");
//         //   const text = await view.text();
//         //   if (text && text.trim() === "查找民宿") {
//         //     console.log("###点击查找民宿按钮");
//         //     view.tap();
//         //   }
//         // }
//       } catch (e) {
//         console.log("###element not exist!", e);
//       }
//       // await miniProgram.disconnect();
//       // await miniProgram.close();
//     });
// }

// // tapFirstItem();

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
  } catch (err: any) {
    console.error(
      `[create session] unable to launch miniProgram devtools, trying to kill process`
    )
    // await killProcess()
    throw new Error('miniProgram devtools launch failed')
  }

  // 启动主账号
  const page = await miniProgram.reLaunch(
    '/pages/product/product?productId=5123688&poiId=188074393'
  )
  console.log('###wait for page')
  await page.waitFor(5000)
  await slide(miniProgram, page)

  // 如果有测试账号，就启动多个调试窗口
  // const testAccounts = await miniProgram.testAccounts()
  // if (testAccounts?.length) {
  //   console.log('###发现有多账号，将启动多个调试窗口', testAccounts)
  //   for (let i = 0, len = testAccounts.length; i < len; i++) {
  //     const testMiniProgram = await automator.launch({
  //       projectPath: '../phx-miniapp/dist', // 项目文件地址
  //       account: testAccounts[i].openid,
  //     })
  //     const testPage = await testMiniProgram.reLaunch(
  //       '/subpackage/home/index/index'
  //     )
  //     await testPage.waitFor(500)
  //     await launch(testMiniProgram, testPage)
  //   }
  // }
}

export async function slide(miniProgram, page) {
  console.log('【用例】：滑动相册图片')

  const pageElem = await page.$('page')
  if (true) {
    const swiperContainer = await page.$(
      'wxswiper[data-accessibilitylabel$="821F1A6BEFAAB419"]'
    )
    console.log('###swiperContainer', swiperContainer)
    // const swiperComponent = await page.$(
    //   'view[data-accessibilitylabel$="4A6CD79C84131096"]'
    // )
    const swiperComponent = await swiperContainer.$('swiper')
    const startX = 94
    const endX = 281
    const startY = 281
    const endY = 94
    await swiperComponent.touchstart({
      touches: [
        {
          identifier: 1,
          pageX: startX,
          pageY: startY,
        },
      ],
      changedTouches: [
        {
          identifier: 1,
          pageX: startX,
          pageY: startY,
        },
      ],
    })
    await swiperComponent.touchmove({
      touches: [],
      changedTouches: [
        {
          identifier: 1,
          pageX: endX,
          pageY: endY,
        },
      ],
    })
    await swiperComponent.touchend({
      touches: [],
      changedTouches: [
        {
          identifier: 1,
          pageX: endX,
          pageY: endY,
        },
      ],
    })
  }
  // await miniProgram.close()
  // setTimeout(async () => {
  //   const photoView = await client.$('~98B9E62E205C1129')
  //   const firstPhotoView = await photoView.$('<swiper-item />')
  //   const image = await firstPhotoView.$('<image />')
  //   const imageDisplayed = await image.isDisplayed()
  //   if (imageDisplayed) {
  //     await image.click()
  //   }
  // }, 15000)
}

async function launch(miniProgram, page) {
  try {
    const searchButton = await page.$(
      'view[data-accessibilitylabel$="E8FA617C109DB7B3"]'
    )
    const text = await searchButton.text()
    if (text && text.trim() === '查找民宿') {
      console.log('###点击查找民宿按钮')
      searchButton.tap()

      await page.waitFor(3000) // 等待 3 秒
      const currentPage = await miniProgram.currentPage()

      const cityNameView = await currentPage.$(
        'view[data-accessibilitylabel$="20292C2385A7E3F2"]'
      )
      const cityName = await cityNameView.text()
      console.log('###cityName', cityName)
    }
    // const linearGradientContainer = await searchView.$$(
    //   ".linearGradient-container"
    // );
    // console.log("###length", linearGradientContainer.length);
    // for (let i = 0; i < linearGradientContainer.length; i++) {
    //   const view = await linearGradientContainer[i].$("view");
    //   const text = await view.text();
    //   if (text && text.trim() === "查找民宿") {
    //     console.log("###点击查找民宿按钮");
    //     view.tap();
    //   }
    // }
  } catch (e) {
    console.log('###element not exist!', e)
  }
  // await miniProgram.disconnect();
  // await miniProgram.close();
}

async function setKeyword(miniProgram, page) {
  try {
    const keywordView = await page.$(
      'view[data-accessibilitylabel$="AFA53B733041F6DF"]'
    )
    keywordView.tap()

    await page.waitFor(2000)
    const currentPage = await miniProgram.currentPage()

    const keywordInput = await currentPage.$('input[name=keyword]')
    keywordInput.input('中山路')
    console.log('###搜索关键字设置为【中山路】')

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
  await loop(func, 1)
  console.log('###成功执行 1 次用例')
}

main()
