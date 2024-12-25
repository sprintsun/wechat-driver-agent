import { merge } from 'lodash'
import defaultConfig from './default'

const env = process.env.NODE_ENV

let envConfig = {}
try {
  env && (envConfig = require(`./${env}`))
} catch (e) {
  console.error(`config ${env}.js is not exist `)
}

const config = merge({}, defaultConfig, envConfig)

export default config
