import { Data } from "effect"

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string
  readonly input?: string
}> {}

export class ProviderError extends Data.TaggedError("ProviderError")<{
  readonly provider: string
  readonly message: string
}> {}

export class HttpError extends Data.TaggedError("HttpError")<{
  readonly url: string
  readonly status?: number
  readonly message: string
  readonly body?: string
}> {}

export class RateLimitError extends Data.TaggedError("RateLimitError")<{
  readonly provider: string
  readonly retryAfter?: string
}> {}

export class DecodeError extends Data.TaggedError("DecodeError")<{
  readonly provider: string
  readonly message: string
  readonly path?: string
}> {}

export class CacheError extends Data.TaggedError("CacheError")<{
  readonly message: string
}> {}

export class RenderError extends Data.TaggedError("RenderError")<{
  readonly message: string
}> {}

export type AppError =
  | ValidationError
  | ProviderError
  | HttpError
  | RateLimitError
  | DecodeError
  | CacheError
  | RenderError

export const renderAppError = (error: AppError): string => {
  switch (error._tag) {
    case "ValidationError":
      return error.input === undefined
        ? `Validation error: ${error.message}`
        : `Validation error for "${error.input}": ${error.message}`
    case "ProviderError":
      return `${error.provider} provider error: ${error.message}`
    case "HttpError":
      return error.status === undefined
        ? `HTTP error while calling ${error.url}: ${error.message}`
        : `HTTP ${error.status} while calling ${error.url}: ${error.message}`
    case "RateLimitError":
      return error.retryAfter === undefined
        ? `${error.provider} rate limit reached. Try again later, use cache, or configure an API key.`
        : `${error.provider} rate limit reached. Retry after ${error.retryAfter}.`
    case "DecodeError":
      return error.path === undefined
        ? `${error.provider} decode error: ${error.message}`
        : `${error.provider} decode error at ${error.path}: ${error.message}`
    case "CacheError":
      return `Cache error: ${error.message}`
    case "RenderError":
      return `Render error: ${error.message}`
  }
}

export const renderUnknownError = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "_tag" in error) {
    const tagged = error as { readonly _tag: string }

    if (
      tagged._tag === "ValidationError" ||
      tagged._tag === "ProviderError" ||
      tagged._tag === "HttpError" ||
      tagged._tag === "RateLimitError" ||
      tagged._tag === "DecodeError" ||
      tagged._tag === "CacheError" ||
      tagged._tag === "RenderError"
    ) {
      return renderAppError(error as AppError)
    }

    return `CLI error: ${tagged._tag}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Unknown error"
}
