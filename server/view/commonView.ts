const path = require('path')
const { client } = require('../config')
const { getAssets } = require('../utils/assets')

const root = path.resolve(__dirname, '../../')
const devMode = process.env.NODE_ENV !== 'production'

function escapeHTML(content) {
  return content.replace(/[<]/g, '\\u003c');
}

module.exports = function (props) {
  const { title, pageName, userInfo = {} } = props
  const { js: { app, vendor }, css } = getAssets({ root, key: pageName })
  const clientConfig = `var __CLIENT_CONFIG__ = ${escapeHTML(JSON.stringify(client))}`
  const user = `var __USER_INFO__ = ${escapeHTML(JSON.stringify(userInfo))}`
  return (
    `<html lang="zh-cmn-Hans">
      <head>
        <meta charSet="utf-8"/>
        <meta name="renderer" content="webkit"/>
        <meta name="format-detection" content="email=no,adress=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
        <title>${title}</title>
        ${devMode ? '' : `<link rel="stylesheet" type="text/css" href="${css}" />`}
        <script>${clientConfig}</script>
        <script>${user}</script>
      </head>
      <body>
        <div id="app"></div>
        <script src="${vendor}"></script>
        <script src="${app}"></script>
      </body>
    </html>`
  )
}
