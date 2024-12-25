const { client } = require('../config')

function escapeHTML(content) {
  return content.replace(/[<]/g, '\\u003c')
}

module.exports = function (props) {
  const { title } = props
  const clientConfig = `var __CLIENT_CONFIG__ = ${escapeHTML(JSON.stringify(client))}`
  return (
    `<html lang="zh-cmn-Hans">
      <head>
        <meta charSet="utf-8"/>
        <meta name="renderer" content="webkit"/>
        <meta name="format-detection" content="telephone=no,email=no,adress=no" />
        <title>${title}</title>
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <script>${clientConfig}</script>
      </head>
      <body>
        <div id="app">server error</div>
      </body>
    </html>`
  )
}
