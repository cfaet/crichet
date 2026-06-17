import { Effect } from "effect"
import { DecodeError, ProviderError } from "../../app/errors"
import { showCoinId, unsafeCoinId } from "../../domain/coin"
import type { CoinMarketData, MarketQuery } from "../../domain/market-data"
import type { CoinGeckoMarketRow } from "./schema"

const provider = "coingecko"

const parseDate = (input: string, path: string): Effect.Effect<Date, DecodeError> => {
  const date = new Date(input)

  if (Number.isNaN(date.getTime())) {
    return Effect.fail(
      new DecodeError({
        provider,
        path,
        message: `invalid ISO date: ${input}`
      })
    )
  }

  return Effect.succeed(date)
}

const toMarketData = (row: CoinGeckoMarketRow): Effect.Effect<CoinMarketData, DecodeError> =>
  Effect.gen(function* () {
    const lastUpdatedAt = yield* parseDate(row.last_updated, `${row.id}.last_updated`)

    return {
      id: unsafeCoinId(row.id),
      name: row.name,
      symbol: row.symbol.toUpperCase(),
      price: row.current_price,
      marketCap: row.market_cap,
      volume24h: row.total_volume,
      change24hPct: row.price_change_percentage_24h_in_currency ?? row.price_change_percentage_24h,
      lastUpdatedAt
    }
  })

export const mapCoinGeckoMarkets = (
  query: MarketQuery,
  rows: ReadonlyArray<CoinGeckoMarketRow>
): Effect.Effect<ReadonlyArray<CoinMarketData>, DecodeError | ProviderError> =>
  Effect.gen(function* () {
    const byId = new Map(rows.map((row) => [row.id, row]))
    const missing = query.coinIds.map(showCoinId).filter((coinId) => !byId.has(coinId))

    if (missing.length > 0) {
      return yield* Effect.fail(
        new ProviderError({
          provider,
          message: `CoinGecko did not return data for: ${missing.join(", ")}. Use canonical coin IDs.`
        })
      )
    }

    return yield* Effect.forEach(query.coinIds, (coinId) => {
      const row = byId.get(showCoinId(coinId))

      if (row === undefined) {
        return Effect.fail(
          new ProviderError({
            provider,
            message: `CoinGecko did not return data for: ${showCoinId(coinId)}`
          })
        )
      }

      return toMarketData(row)
    })
  })
