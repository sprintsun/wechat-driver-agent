export async function viewThePhotoAlbum(client) {
  console.log('【用例】：查看相册图片')

  setTimeout(async () => {
    const photoView = await client.$('~98B9E62E205C1129')
    const firstPhotoView = await photoView.$('<swiper-item />')
    const image = await firstPhotoView.$('<image />')
    const imageDisplayed = await image.isDisplayed()
    if (imageDisplayed) {
      await image.click()
    }
  }, 15000)

  // const searchMoreButton = await client.$('~CC6F3936D7CBD892')
  // console.log('###点击显示更多“热门入住地”房源的按钮')
  // await searchMoreButton.click()

  // /* 筛搜页 */
  // // 延迟 3s 执行脚本，暂时没找到更好延时执行 API 调用
  // setTimeout(async () => {
  //   const cityNameView = await client.$('~774C0BB48415405D')
  //   const cityName = await getElementText(client, '774C0BB48415405D')
  //   if (cityName.trim() === searchParams.cityName) {
  //     console.log('城市参数正确')
  //   }

  //   // 原来页面的元素是否还显示
  //   const searchMoreButtonDisplayed = await searchMoreButton.isDisplayed()
  //   console.log('###searchMoreButtonDisplayed:', searchMoreButtonDisplayed)
  //   const cityNameViewDisplayed = await cityNameView.isDisplayed()
  //   console.log('###cityNameViewDisplayed:', cityNameViewDisplayed)
  // }, 3000)
}

export async function slide(client) {
  console.log('【用例】：滑动相册图片')

  const swiperContainer = await client.$(`~821F1A6BEFAAB419`)
  const swiperContainerDisplayed = await swiperContainer.isDisplayed()
  if (swiperContainerDisplayed) {
    const swiperComponent = await swiperContainer.$('<swiper />')
    // const swiperTouchComponennt = await swiperContainer.$('~11085538273DC95D')
    const { x, y, width, height } = await client.getElementRect(
      swiperComponent.elementId
    )
    const startX = x + Math.round(width * 0.75)
    const endX = x + Math.round(width * 0.25)
    const startY = y + height / 2
    const endY = y + height / 2
    await swiperComponent.touchAction([
      { action: 'press', x: startX, y: startY },
      { action: 'wait', ms: 1000 },
      { action: 'moveTo', x: endX, y: endY },
      'release',
    ])
    await swiperComponent.touchAction([
      { action: 'press', x: startX, y: startY },
      { action: 'wait', ms: 1000 },
      { action: 'moveTo', x: endX, y: endY },
      'release',
    ])
    await swiperComponent.touchAction([
      { action: 'press', x: startX, y: startY },
      { action: 'wait', ms: 1000 },
      { action: 'moveTo', x: endX, y: endY },
      'release',
    ])
  }
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
