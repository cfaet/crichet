# crypto-fetcher

Milestone 1: a strict Bun + TypeScript + Effect CLI scaffold with a fake market-data provider.

No real crypto API is called yet. That is deliberate. We first build the shell, domain model, rendering, and typed error shape so the real provider can be added without turning the project into async spaghetti with a logo.

## Install

```sh
bun install
```

## Run

```sh
bun run crypto bitcoin ethereum solana
bun run crypto bitcoin ethereum --vs pen
bun run crypto bitcoin --output json
bun run crypto --help
bun run crypto --version
```

## Checks

```sh
bun run check
bun test
bun run lint
```

## Milestone 1 includes

- Effect CLI command shell
- typed positional coin arguments
- typed `--vs`, `--output`, and `--provider` options
- fake provider behind a provider interface
- domain validation for canonical coin IDs
- table renderer
- JSON renderer
- tagged app errors
- basic Bun tests

## Not included yet

- real CoinGecko provider
- HTTP client
- response schemas
- cache
- watch mode
- shell packaging/bin install
