import { Effect } from "effect"
import { HttpError, RateLimitError } from "../../app/errors"
import { showCoinId } from "../../domain/coin"
import type { MarketQuery } from "../../domain/market-data"
import { readAnyCachedJson, readCachedJson, writeCachedJson } from "../../infra/json-cache"

const provider = "coingecko"
const freshCacheTtlMs = 30_000

const envValue = (name: string): string | undefined => process.env[name]

const defaultBaseUrl = (): string =>
  envValue("COINGECKO_PRO_API_KEY") === undefined
    ? "https://api.coingecko.com/api/v3"
    : "https://pro-api.coingecko.com/api/v3"

const apiBaseUrl = (): string => envValue("COINGECKO_API_BASE_URL") ?? defaultBaseUrl()

const apiHeaders = (): HeadersInit => {
  const proApiKey = envValue("COINGECKO_PRO_API_KEY")

  if (proApiKey !== undefined) {
    return { "x-cg-pro-api-key": proApiKey }
  }

  const demoApiKey = envValue("COINGECKO_DEMO_API_KEY")

  if (demoApiKey !== undefined) {
    return { "x-cg-demo-api-key": demoApiKey }
  }

  return {}
}

export const buildCoinGeckoMarketsUrl = (query: MarketQuery): URL => {
  const url = new URL(`${apiBaseUrl().replace(/\/$/u, "")}/coins/markets`)
  url.searchParams.set("vs_currency", query.vsCurrency)
  url.searchParams.set("ids", query.coinIds.map(showCoinId).join(","))
  url.searchParams.set("order", "market_cap_desc")
  url.searchParams.set("per_page", String(Math.min(query.coinIds.length, 250)))
  url.searchParams.set("page", "1")
  url.searchParams.set("sparkline", "false")
  url.searchParams.set("price_change_percentage", "24h")
  url.searchParams.set("locale", "en")
  return url
}

const describeUnknown = (cause: unknown): string =>
  cause instanceof Error ? cause.message : String(cause)

const readText = (response: Response, url: URL): Effect.Effect<string, HttpError> =>
  Effect.tryPromise({
    try: () => response.text(),
    catch: (cause) =>
      new HttpError({
        url: url.toString(),
        status: response.status,
        message: `failed to read response body: ${describeUnknown(cause)}`
      })
  })

const readJson = (response: Response, url: URL): Effect.Effect<unknown, HttpError> =>
  Effect.tryPromise({
    try: () => response.json() as Promise<unknown>,
    catch: (cause) =>
      new HttpError({
        url: url.toString(),
        status: response.status,
        message: `failed to parse JSON response: ${describeUnknown(cause)}`
      })
  })

const fetchJson = (url: URL): Effect.Effect<unknown, HttpError | RateLimitError> =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch(url, { headers: apiHeaders() }),
      catch: (cause) =>
        new HttpError({
          url: url.toString(),
          message: `request failed: ${describeUnknown(cause)}`
        })
    })

    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after")

      return yield* Effect.fail(
        new RateLimitError(
          retryAfter === null
            ? { provider }
            : {
                provider,
                retryAfter
              }
        )
      )
    }

    if (!response.ok) {
      const body = yield* readText(response, url)

      return yield* Effect.fail(
        new HttpError({
          url: url.toString(),
          status: response.status,
          message: response.statusText.length === 0 ? "unexpected non-2xx response" : response.statusText,
          body: body.slice(0, 500)
        })
      )
    }

    return yield* readJson(response, url)
  })

const cacheKey = (url: URL): string => `${provider}:${url.toString()}`

export const getCoinGeckoMarketsJson = (query: MarketQuery): Effect.Effect<unknown, HttpError | RateLimitError> => {
  const url = buildCoinGeckoMarketsUrl(query)
  const key = cacheKey(url)

  return readCachedJson(key, freshCacheTtlMs).pipe(
    Effect.flatMap((cached) => {
      if (cached !== null) {
        return Effect.succeed(cached)
      }

      return fetchJson(url).pipe(
        Effect.tap((body) => writeCachedJson(key, body)),
        Effect.catchAll((error) =>
          readAnyCachedJson(key).pipe(
            Effect.flatMap((staleCached) => (staleCached === null ? Effect.fail(error) : Effect.succeed(staleCached)))
          )
        )
      )
    })
  )
}
