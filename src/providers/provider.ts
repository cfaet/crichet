import { Context, Effect } from "effect"
import { ProviderError, type AppError } from "../app/errors"
import type { CoinMarketData, MarketProviderName, MarketQuery } from "../domain/market-data"

export type MarketDataProvider = {
  readonly getMarkets: (
    query: MarketQuery
  ) => Effect.Effect<ReadonlyArray<CoinMarketData>, AppError>
}

export class MarketDataProviderRegistry extends Context.Tag("crypto-fetcher/MarketDataProviderRegistry")<
  MarketDataProviderRegistry,
  {
    readonly getMarkets: (
      providerName: MarketProviderName,
      query: MarketQuery
    ) => Effect.Effect<ReadonlyArray<CoinMarketData>, AppError>
  }
>() {}

export const makeMarketDataProviderRegistry = (
  providers: Readonly<Record<MarketProviderName, MarketDataProvider>>
) => ({
  getMarkets: (providerName: MarketProviderName, query: MarketQuery) => {
    const provider = providers[providerName]

    if (provider === undefined) {
      return Effect.fail(
        new ProviderError({
          provider: providerName,
          message: "provider is not registered"
        })
      )
    }

    return provider.getMarkets(query)
  }
})
