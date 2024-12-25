import globalState from '../service/state'
import logger from '../service/logger'
import {
  NoSuchElementError,
  InvalidSessionIdError,
  ElementNotInteractableError,
  InvalidArgumentError,
} from '../utils/error'

export default async function (ctx, next) {
  try {
    await next()
    const sessionId = ctx?.params?.sessionId
    const currentSessionId = globalState.getValue('sessionId')
    if (sessionId && currentSessionId && sessionId !== currentSessionId) {
      throw new InvalidSessionIdError()
    }
  } catch (error: any) {
    if (error instanceof NoSuchElementError) {
      logger.error(`server error, ${error.message || error}`)
      ctx.status = 404
      // https://w3c.github.io/webdriver/#dfn-no-such-element
      ctx.body = {
        value: {
          error: 'no such element',
          message:
            'An element could not be located on the page using the given search parameters',
          stacktrace: error.stack,
        },
      }
      return
    }
    if (error instanceof InvalidSessionIdError) {
      logger.error(`server error, ${error.message || error}`)
      const { sessionId } = ctx.params
      ctx.status = 404
      // https://w3c.github.io/webdriver/#dfn-no-such-element
      ctx.body = {
        value: {
          error: 'invalid session id',
          message: `No active session with ID ${sessionId}`,
          stacktrace: error.stack,
        },
      }
      return
    }
    if (error instanceof ElementNotInteractableError) {
      logger.error(`server error, ${error.message || error}`)
      ctx.status = 400
      // https://w3c.github.io/webdriver/#dfn-element-not-interactable
      ctx.body = {
        value: {
          error: 'element not interactable',
          message: `A command could not be completed because the element is not pointer- or keyboard interactable.`,
          stacktrace: error.stack,
        },
      }
      return
    }
    if (error instanceof InvalidArgumentError) {
      logger.error(`server error, ${error.message || error}`)
      ctx.status = 400
      // https://w3c.github.io/webdriver/#dfn-element-not-interactable
      ctx.body = {
        value: {
          error: 'invalid argument',
          message: `The arguments passed to a command are either invalid or malformed.`,
          stacktrace: error.stack,
        },
      }
      return
    }
    // TODO: 其他异常处理
    logger.error(`server error, ${error.stack || error}`)
    ctx.status = 500
    // https://w3c.github.io/webdriver/#dfn-no-such-element
    ctx.body = {
      value: {
        error: 'server error',
        message: error.message || 'server error',
        stacktrace: error.stack,
      },
    }
    return
  }

  if (ctx.status === 404) {
    logger.warn(`404 not found: ${ctx.path}`)
  } else if (ctx.status >= 500) {
    logger.error(`koa error: ${ctx.error ? ctx.error.stack : ctx.status}`)
  }
}
