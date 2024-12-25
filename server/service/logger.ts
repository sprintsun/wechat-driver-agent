import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import chalk from 'chalk'
import config from '../config'

const { NODE_ENV } = process.env
const { log } = config

const symbol = {
  debug: chalk.blue('ℹ'),
  info: chalk.green('✔'),
  warn: chalk.yellow('⚠'),
  error: chalk.red('✖'),
}

const colors = {
  debug: '37m',
  info: '36m',
  warn: '33m',
  error: '31m',
}

const consoleTransport = new winston.transports.Console({
  level: 'debug',
  format: winston.format.combine(
    winston.format.label({
      label: `WDA`,
    }),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf(
      (info) =>
        `${symbol[info.level]} ${chalk.grey(`[${info.label}]`)} ${[
          chalk.grey(`[${info.timestamp}]`),
        ]}: \u001b[1m\u001b[${colors[info.level] || '37m'}${
          info.message
        }\u001b[39m\u001b[22m`
    )
  ),
})

const infoFileTransport = new DailyRotateFile({
  datePattern: 'YYYY-MM-DD',
  // name: 'info-file',
  level: 'debug',
  json: false,
  dirname: log.path,
  filename: 'wda.all.log',
  maxSize: '500m', // 100MB
  maxFiles: 30,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf(
      (info) => `[${info.level}] [${info.timestamp}]: ${info.message}`
    )
  ),
})

const errorFileTransport = new DailyRotateFile({
  datePattern: 'YYYY-MM-DD',
  // name: 'error-file',
  level: 'error',
  json: false,
  dirname: log.path,
  filename: 'wda.error.log',
  maxSize: '100m', // 100MB
  maxFiles: 30,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf(
      (info) => `[${info.level}] [${info.timestamp}]: ${info.message}`
    )
  ),
})

// https://github.com/winstonjs/winston/blob/master/docs/transports.md
const transports =
  NODE_ENV === 'production'
    ? [infoFileTransport, errorFileTransport]
    : [consoleTransport, infoFileTransport, errorFileTransport]

const logger = winston.createLogger({ transports })

export default logger
