import { Args, Command, Options } from "@effect/cli"
import { runProgram } from "../app/program"
import { supportedCurrencies } from "../domain/currency"
import { supportedMarketProviders, type OutputFormat } from "../domain/market-data"

const supportedOutputs = ["table", "json"] as const satisfies ReadonlyArray<OutputFormat>

const coins = Args.text({ name: "coin" }).pipe(
  Args.atLeast(1),
  Args.withDescription("Canonical CoinGecko coin IDs, for example: bitcoin ethereum solana")
)

const vsCurrency = Options.choice("vs", supportedCurrencies).pipe(
  Options.withDescription("Quote currency"),
  Options.withDefault("usd")
)

const output = Options.choice("output", supportedOutputs).pipe(
  Options.withAlias("o"),
  Options.withDescription("Output format"),
  Options.withDefault("table")
)

const provider = Options.choice("provider", supportedMarketProviders).pipe(
  Options.withDescription("Market data provider"),
  Options.withDefault("coingecko")
)

export const command = Command.make(
  "crypto",
  {
    coins,
    output,
    provider,
    vsCurrency
  },
  ({ coins, output, provider, vsCurrency }) =>
    runProgram({
      coins,
      output,
      provider,
      vsCurrency
    })
)
