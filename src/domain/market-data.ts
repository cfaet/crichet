import type { CoinId } from "./coin"
import type { VsCurrency } from "./currency"

export type MarketProviderName = "stub"

export type OutputFormat = "table" | "json"

export type MarketQuery = {
  readonly coinIds: ReadonlyArray<CoinId>
  readonly vsCurrency: VsCurrency
}

export type CoinMarketData = {
  readonly id: CoinId
  readonly name: string
  readonly symbol: string
  readonly price: number
  readonly marketCap: number | null
  readonly volume24h: number | null
  readonly change24hPct: number | null
  readonly lastUpdatedAt: Date
}
