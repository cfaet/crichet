import { Effect } from "effect"
import type { CoinMarketData, MarketQuery } from "../../domain/market-data"
import type { AppError } from "../../app/errors"
import type { MarketDataProvider } from "../provider"
import { getCoinGeckoMarketsJson } from "./client"
import { mapCoinGeckoMarkets } from "./mapper"
import { decodeCoinGeckoMarkets } from "./schema"

const getMarkets = (query: MarketQuery): Effect.Effect<ReadonlyArray<CoinMarketData>, AppError> =>
  Effect.gen(function* () {
    const json = yield* getCoinGeckoMarketsJson(query)
    const rows = yield* decodeCoinGeckoMarkets(json)
    return yield* mapCoinGeckoMarkets(query, rows)
  })

export const CoinGeckoMarketDataProvider: MarketDataProvider = {
  getMarkets
}
