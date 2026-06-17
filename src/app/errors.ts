import { Data } from "effect"

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string
  readonly input?: string
}> {}

export class ProviderError extends Data.TaggedError("ProviderError")<{
  readonly provider: string
  readonly message: string
}> {}

export class RenderError extends Data.TaggedError("RenderError")<{
  readonly message: string
}> {}

export type AppError = ValidationError | ProviderError | RenderError

export const renderAppError = (error: AppError): string => {
  switch (error._tag) {
    case "ValidationError":
      return error.input === undefined
        ? `Validation error: ${error.message}`
        : `Validation error for "${error.input}": ${error.message}`
    case "ProviderError":
      return `${error.provider} provider error: ${error.message}`
    case "RenderError":
      return `Render error: ${error.message}`
  }
}

export const renderUnknownError = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "_tag" in error) {
    const tagged = error as { readonly _tag: string }

    if (tagged._tag === "ValidationError" || tagged._tag === "ProviderError" || tagged._tag === "RenderError") {
      return renderAppError(error as AppError)
    }

    return `CLI error: ${tagged._tag}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Unknown error"
}
