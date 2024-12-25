import path from 'path'

const devMode = process.env.NODE_ENV !== 'production'

function returnFirstArg(argOne) {
  return argOne
}

function generateFullPath(asset) {
  return asset.indexOf('http') === 0 ? asset : `/${asset}`
}

function loadFile(filePath) {
  let cache = null
  return function () {
    if (devMode) {
      cache = null
      delete require.cache[filePath]
    }
    if (cache) return cache
    cache = require(filePath) // eslint-disable-line
    return cache
  }
}

/**
 * @description Assets 返回一个获取 assets 地址的函数
 * @param {Object} webpackAssets 由 assets-webpack-plugin 生成的 JSON 内容,详见 {@link ../assets.json}
 * @param {Function} [baseParser] 用于处理结果的后置函数
 * @returns {Function}
 * @constructor
 */
function getAssetsInfo(webpackAssets, baseParser = returnFirstArg) {
  /**
   * @description 获取资源地址
   * @link webpack/assets.json
   * @param {String} chunkName 入口资源的名字
   * @param {String} [kind] 资源类型
   * @returns {String} 资源地址
   * @throw {ReferenceError} 未找到指定资源
   */
  return function generatePath(chunkName, kind = 'js') {
    if (!webpackAssets[chunkName] || !webpackAssets[chunkName][kind]) {
      throw new ReferenceError(
        `["${chunkName}"]["${kind}"] is not in assets object.`
      )
    }
    return baseParser(webpackAssets[chunkName][kind])
  }
}

function getVendorPath(vendorInfo, baseParser = returnFirstArg) {
  const vendorFileName = `${vendorInfo.name}.js`
  return baseParser(vendorFileName)
}

function getAssets({ root, key, other }) {
  const assetsPath = path.resolve(root, 'dist/assets.json')
  const vendorPath = path.resolve(root, 'dist/vendor.json')
  try {
    const assetsInfo = loadFile(assetsPath)()
    const vendorInfo = loadFile(vendorPath)()
    const getAssetsPath = getAssetsInfo(assetsInfo, generateFullPath)
    const result = {
      js: {
        app: getAssetsPath(key, 'js'),
        vendor: getVendorPath(vendorInfo, generateFullPath),
      },
      css: devMode ? '' : getAssetsPath(key, 'css'), // 开发环境下不存在css资源
    } as { js: any; css: any }
    if (other) {
      result.js.other = getAssetsPath(other, 'js')
    }
    return result
  } catch (e) {
    console.error('getAssets error: ', e)
  }
  return { js: { app: '', vendor: '' }, css: '' }
}

module.exports = { getAssets }
