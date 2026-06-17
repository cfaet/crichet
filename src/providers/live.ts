import { Layer } from "effect"
import { CoinGeckoMarketDataProvider } from "./coingecko/provider"
import { makeMarketDataProviderRegistry, MarketDataProviderRegistry } from "./provider"
import { StubMarketDataProvider } from "./stub"

export const MarketDataProviderRegistryLive = Layer.succeed(
  MarketDataProviderRegistry,
  makeMarketDataProviderRegistry({
    coingecko: CoinGeckoMarketDataProvider,
    stub: StubMarketDataProvider
  })
)
