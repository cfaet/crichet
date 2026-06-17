import { Effect, Layer } from "effect"
import { ProviderError } from "../app/errors"
import { showCoinId, type CoinId } from "../domain/coin"
import type { CoinMarketData, MarketQuery } from "../domain/market-data"
import { MarketDataProvider } from "./provider"

const fixedUpdatedAt = new Date("2026-01-01T00:00:00.000Z")

type StubMarketRow = Omit<CoinMarketData, "id" | "lastUpdatedAt">

const stubMarketRows: Record<string, StubMarketRow> = {
  bitcoin: {
    name: "Bitcoin",
    symbol: "BTC",
    price: 104_231.22,
    marketCap: 2_070_000_000_000,
    volume24h: 38_200_000_000,
    change24hPct: 1.24
  },
  ethereum: {
    name: "Ethereum",
    symbol: "ETH",
    price: 3_812.09,
    marketCap: 459_100_000_000,
    volume24h: 21_400_000_000,
    change24hPct: -0.82
  },
  solana: {
    name: "Solana",
    symbol: "SOL",
    price: 188.42,
    marketCap: 89_500_000_000,
    volume24h: 4_900_000_000,
    change24hPct: 2.67
  }
}

const fallbackMarketRow = (coinId: CoinId): StubMarketRow => {
  const id = showCoinId(coinId)
  return {
    name: id,
    symbol: id.slice(0, 4).toUpperCase(),
    price: 1,
    marketCap: null,
    volume24h: null,
    change24hPct: null
  }
}

const toMarketData = (coinId: CoinId): CoinMarketData => {
  const row = stubMarketRows[showCoinId(coinId)] ?? fallbackMarketRow(coinId)
  return {
    id: coinId,
    name: row.name,
    symbol: row.symbol,
    price: row.price,
    marketCap: row.marketCap,
    volume24h: row.volume24h,
    change24hPct: row.change24hPct,
    lastUpdatedAt: fixedUpdatedAt
  }
}

const getMarkets = (
  query: MarketQuery
): Effect.Effect<ReadonlyArray<CoinMarketData>, ProviderError> => {
  if (query.coinIds.length === 0) {
    return Effect.fail(
      new ProviderError({
        provider: "stub",
        message: "expected at least one coin id"
      })
    )
  }

  return Effect.succeed(query.coinIds.map(toMarketData))
}

export const StubMarketDataProviderLive = Layer.succeed(MarketDataProvider, {
  getMarkets
})
