import { Context, Effect } from "effect"
import type { AppError } from "../app/errors"
import type { CoinMarketData, MarketQuery } from "../domain/market-data"

export class MarketDataProvider extends Context.Tag("crypto-fetcher/MarketDataProvider")<
  MarketDataProvider,
  {
    readonly getMarkets: (
      query: MarketQuery
    ) => Effect.Effect<ReadonlyArray<CoinMarketData>, AppError>
  }
>() {}
