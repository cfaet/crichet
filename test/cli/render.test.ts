import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { makeCoinId } from "../../src/domain/coin"
import type { CoinMarketData } from "../../src/domain/market-data"
import { renderJson, renderTable } from "../../src/cli/render"

const bitcoin = Effect.runSync(makeCoinId("bitcoin"))

const marketData: ReadonlyArray<CoinMarketData> = [
  {
    id: bitcoin,
    name: "Bitcoin",
    symbol: "BTC",
    price: 104_231.22,
    marketCap: 2_070_000_000_000,
    volume24h: 38_200_000_000,
    change24hPct: 1.24,
    lastUpdatedAt: new Date("2026-01-01T00:00:00.000Z")
  }
]

describe("CLI rendering", () => {
  test("renders a table", () => {
    const table = renderTable(marketData, "usd")
    expect(table).toContain("Bitcoin")
    expect(table).toContain("BTC")
    expect(table).toContain("+1.24%")
  })

  test("renders stable JSON", () => {
    const json = renderJson(marketData)
    expect(JSON.parse(json)).toEqual([
      {
        id: "bitcoin",
        name: "Bitcoin",
        symbol: "BTC",
        price: 104_231.22,
        marketCap: 2_070_000_000_000,
        volume24h: 38_200_000_000,
        change24hPct: 1.24,
        lastUpdatedAt: "2026-01-01T00:00:00.000Z"
      }
    ])
  })
})
