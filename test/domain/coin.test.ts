import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { makeCoinId, makeCoinIds, showCoinId } from "../../src/domain/coin"

describe("coin domain", () => {
  test("normalizes a canonical coin id", () => {
    const coin = Effect.runSync(makeCoinId(" Bitcoin "))
    expect(showCoinId(coin)).toBe("bitcoin")
  })

  test("deduplicates normalized coin ids", () => {
    const coins = Effect.runSync(makeCoinIds(["bitcoin", "Bitcoin", "ethereum"]))
    expect(coins.map(showCoinId)).toEqual(["bitcoin", "ethereum"])
  })

  test("rejects invalid symbols for now", () => {
    const result = Effect.runSyncExit(makeCoinId("BTC/USDT"))
    expect(result._tag).toBe("Failure")
  })
})
