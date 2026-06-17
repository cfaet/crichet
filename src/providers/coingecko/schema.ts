import { Effect } from "effect"
import { DecodeError } from "../../app/errors"

export type CoinGeckoMarketRow = {
  readonly id: string
  readonly symbol: string
  readonly name: string
  readonly current_price: number | null
  readonly market_cap: number | null
  readonly total_volume: number | null
  readonly price_change_percentage_24h: number | null
  readonly price_change_percentage_24h_in_currency?: number | null
  readonly last_updated: string
}

const provider = "coingecko"

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const stringAt = (record: Record<string, unknown>, key: string, path: string): Effect.Effect<string, DecodeError> => {
  const value = record[key]

  if (typeof value === "string") {
    return Effect.succeed(value)
  }

  return Effect.fail(
    new DecodeError({
      provider,
      path: `${path}.${key}`,
      message: "expected string"
    })
  )
}

const nullableNumberAt = (
  record: Record<string, unknown>,
  key: string,
  path: string
): Effect.Effect<number | null, DecodeError> => {
  const value = record[key]

  if (value === null) {
    return Effect.succeed(null)
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return Effect.succeed(value)
  }

  return Effect.fail(
    new DecodeError({
      provider,
      path: `${path}.${key}`,
      message: "expected finite number or null"
    })
  )
}

const optionalNullableNumberAt = (
  record: Record<string, unknown>,
  key: string,
  path: string
): Effect.Effect<number | null | undefined, DecodeError> => {
  if (!(key in record)) {
    return Effect.succeed(undefined)
  }

  return nullableNumberAt(record, key, path)
}

const decodeMarketRow = (value: unknown, index: number): Effect.Effect<CoinGeckoMarketRow, DecodeError> =>
  Effect.gen(function* () {
    const path = `$[${index}]`

    if (!isRecord(value)) {
      return yield* Effect.fail(
        new DecodeError({
          provider,
          path,
          message: "expected object"
        })
      )
    }

    const id = yield* stringAt(value, "id", path)
    const symbol = yield* stringAt(value, "symbol", path)
    const name = yield* stringAt(value, "name", path)
    const current_price = yield* nullableNumberAt(value, "current_price", path)
    const market_cap = yield* nullableNumberAt(value, "market_cap", path)
    const total_volume = yield* nullableNumberAt(value, "total_volume", path)
    const price_change_percentage_24h = yield* nullableNumberAt(value, "price_change_percentage_24h", path)
    const price_change_percentage_24h_in_currency = yield* optionalNullableNumberAt(
      value,
      "price_change_percentage_24h_in_currency",
      path
    )
    const last_updated = yield* stringAt(value, "last_updated", path)

    const base = {
      id,
      symbol,
      name,
      current_price,
      market_cap,
      total_volume,
      price_change_percentage_24h,
      last_updated
    }

    return price_change_percentage_24h_in_currency === undefined
      ? base
      : {
          ...base,
          price_change_percentage_24h_in_currency
        }
  })

export const decodeCoinGeckoMarkets = (
  value: unknown
): Effect.Effect<ReadonlyArray<CoinGeckoMarketRow>, DecodeError> => {
  if (!Array.isArray(value)) {
    return Effect.fail(
      new DecodeError({
        provider,
        message: "expected top-level array"
      })
    )
  }

  return Effect.forEach(value, decodeMarketRow)
}
