export class NoSuchElementError extends Error {
  public constructor(message?: string) {
    super(message)
    this.name = 'NoSuchElementError'
    this.message =
      message ||
      'An element could not be located on the page using the given search parameters.'
  }
}

export class InvalidSessionIdError extends Error {
  public constructor(message?: string) {
    super(message)
    this.name = 'InvalidSessionIdError'
    this.message =
      message ||
      'Occurs if the given session id is not in the list of active sessions, meaning the session either does not exist or that it’s not active.'
  }
}

export class ElementNotInteractableError extends Error {
  public constructor(message?: string) {
    super(message)
    this.name = 'ElementNotInteractableError'
    this.message =
      message ||
      'A command could not be completed because the element is not pointer- or keyboard interactable.'
  }
}

export class NoSuchWindowError extends Error {
  public constructor(message?: string) {
    super(message)
    this.name = 'NoSuchWindowError'
    this.message =
      message || 'If the currently selected window has been closed.'
  }
}

export class InvalidArgumentError extends Error {
  public constructor(message?: string) {
    super(message)
    this.name = 'InvalidArgumentError'
    this.message =
      message ||
      'The arguments passed to a command are either invalid or malformed.'
  }
}

export class UnsupportedOperationError extends Error {
  public constructor(message?: string) {
    super(message)
    this.name = 'UnsupportedOperationError'
    this.message =
      message ||
      'Indicates that a command that should have executed properly cannot be supported for some reason.'
  }
}

export class MiniprogramAutomatorError extends Error {
  public constructor(message?: string) {
    super(message)
    this.name = 'MiniprogramAutomatorError'
    this.message = message || 'miniprogram automator error'
  }
}
