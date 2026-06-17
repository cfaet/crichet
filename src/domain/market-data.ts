import type { CoinId } from "./coin"
import type { VsCurrency } from "./currency"

export const supportedMarketProviders = ["coingecko", "stub"] as const

export type MarketProviderName = (typeof supportedMarketProviders)[number]

export type OutputFormat = "table" | "json"

export type MarketQuery = {
  readonly coinIds: ReadonlyArray<CoinId>
  readonly vsCurrency: VsCurrency
}

export type CoinMarketData = {
  readonly id: CoinId
  readonly name: string
  readonly symbol: string
  readonly price: number | null
  readonly marketCap: number | null
  readonly volume24h: number | null
  readonly change24hPct: number | null
  readonly lastUpdatedAt: Date
}
