import { Console, Effect } from "effect"
import { renderJson, renderTable } from "../cli/render"
import { makeCoinIds } from "../domain/coin"
import type { VsCurrency } from "../domain/currency"
import type { CoinMarketData, MarketProviderName, MarketQuery, OutputFormat } from "../domain/market-data"
import { MarketDataProviderRegistry } from "../providers/provider"

type RunConfig = {
  readonly coins: ReadonlyArray<string>
  readonly vsCurrency: VsCurrency
  readonly output: OutputFormat
  readonly provider: MarketProviderName
}

const renderOutput = (config: RunConfig, marketData: ReadonlyArray<CoinMarketData>): string => {
  switch (config.output) {
    case "json":
      return renderJson(marketData)
    case "table":
      return renderTable(marketData, config.vsCurrency)
  }
}

export const runProgram = (config: RunConfig) =>
  Effect.gen(function* () {
    const providers = yield* MarketDataProviderRegistry
    const coinIds = yield* makeCoinIds(config.coins)

    const query: MarketQuery = {
      coinIds,
      vsCurrency: config.vsCurrency
    }

    const marketData = yield* providers.getMarkets(config.provider, query)
    const output = renderOutput(config, marketData)

    yield* Console.log(output)
  })
