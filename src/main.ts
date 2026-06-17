import { Command } from "@effect/cli"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Console, Effect, Layer } from "effect"
import { renderUnknownError } from "./app/errors"
import { command } from "./cli/command"
import { MarketDataProviderRegistryLive } from "./providers/live"

const cli = Command.run(command, {
  name: "Crypto Fetcher",
  version: "0.2.0"
})

const MainLayer = Layer.mergeAll(BunContext.layer, MarketDataProviderRegistryLive)

const main = cli(process.argv).pipe(
  Effect.catchAll((error) =>
    Console.error(renderUnknownError(error)).pipe(
      Effect.andThen(
        Effect.sync(() => {
          process.exitCode = 1
        })
      )
    )
  ),
  Effect.provide(MainLayer)
)

BunRuntime.runMain(main)
