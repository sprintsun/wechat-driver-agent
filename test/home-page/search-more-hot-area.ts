const KEYWORD = '搜索民宿/地点/关键词'

export async function searchMoreHotArea(client) {
  console.log(
    '【用例】：【热门入住地】点击「显示更多xx房源」，跳转到筛搜列表页面，带入正确的城市 ID 和入离时间，并选中热门商圈'
  )

  /* 首页 */
  const keywordView = await client.$('~AFA53B733041F6DF')
  await keywordView.waitForDisplayed({ timeout: 10000 })

  const searchParams = await getSearchParams(client)
  console.log('###查询参数', searchParams)

  // 设置关键字
  keywordView.click()
  console.log('###设置关键字')

  const keywordInput = await client.$('[name="keyword"]')
  console.log('###查询关键字组件，等待 20 秒...')
  await keywordInput.waitForDisplayed({ timeout: 20000 })
  keywordInput.setValue('中山路')
  console.log('###搜索关键字设置为【中山路】')
  // await client.deleteSession()

  // setTimeout(async () => {
  //   const keywordInput = await client.$('[name="keyword"]')
  //   keywordInput.setValue('中山路')
  //   console.log('###搜索关键字设置为【中山路】')
  // }, 3000)

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

// 获取首页查询参数
async function getSearchParams(client) {
  const cityName = await getElementText(client, '9B7F1551B39DC4D4')
  const checkInDate = await getElementText(client, 'E72460A65653AE9C')
  const checkOutDate = await getElementText(client, '998AB2BC4DC63A0F')
  const searchKeyWord = await getElementText(client, 'AFA53B733041F6DF')
  return {
    cityName,
    checkInDate,
    checkOutDate,
    searchKeyWord: searchKeyWord === KEYWORD ? '' : searchKeyWord,
  }
}

async function getElementText(client, testId) {
  const element = await client.$(`~${testId}`)
  const text = await element.getText()
  return (text || '').trim()
}
