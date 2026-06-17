import { Effect } from "effect"
import { ValidationError } from "../app/errors"
import { brand, type Brand } from "./brand"

export type CoinId = Brand<string, "CoinId">

const coinIdPattern = /^[a-z0-9][a-z0-9-]*$/u

export const normalizeCoinText = (input: string): string => input.trim().toLowerCase()

export const makeCoinId = (input: string): Effect.Effect<CoinId, ValidationError> => {
  const normalized = normalizeCoinText(input)

  if (normalized.length === 0) {
    return Effect.fail(
      new ValidationError({
        input,
        message: "coin id cannot be empty"
      })
    )
  }

  if (!coinIdPattern.test(normalized)) {
    return Effect.fail(
      new ValidationError({
        input,
        message: "use canonical coin IDs like bitcoin, ethereum, or solana"
      })
    )
  }

  return Effect.succeed(brand<string, "CoinId">(normalized))
}

export const makeCoinIds = (
  inputs: ReadonlyArray<string>
): Effect.Effect<ReadonlyArray<CoinId>, ValidationError> =>
  Effect.forEach(inputs, makeCoinId).pipe(Effect.map(dedupeCoinIds))

export const showCoinId = (coinId: CoinId): string => coinId

const dedupeCoinIds = (coinIds: ReadonlyArray<CoinId>): ReadonlyArray<CoinId> =>
  Array.from(new Set(coinIds))
