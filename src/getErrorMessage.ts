type ErrorMsg = {
  message: string
}

function isErrorWithMessage(error: unknown): error is ErrorMsg {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  )
}

function toErrorWithMessage(maybeError: unknown): ErrorMsg {
  if (isErrorWithMessage(maybeError)) {
    return maybeError
  }

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError))
  }
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message
}
