import { Command } from "@effect/cli"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Console, Effect, Layer } from "effect"
import { renderUnknownError } from "./app/errors"
import { command } from "./cli/command"
import { StubMarketDataProviderLive } from "./providers/stub"

const cli = Command.run(command, {
  name: "Crypto Fetcher",
  version: "0.1.0"
})

const MainLayer = Layer.mergeAll(BunContext.layer, StubMarketDataProviderLive)

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
