import { Effect } from "effect"
import { createHash } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { dirname, join } from "node:path"

type CacheEnvelope = {
  readonly savedAtMs: number
  readonly body: unknown
}

const cacheRoot = (): string => {
  const xdgCacheHome = process.env["XDG_CACHE_HOME"]

  return xdgCacheHome === undefined
    ? join(homedir(), ".cache", "crypto-fetcher")
    : join(xdgCacheHome, "crypto-fetcher")
}

const cachePath = (key: string): string => {
  const digest = createHash("sha256").update(key).digest("hex")
  return join(cacheRoot(), `${digest}.json`)
}

const isCacheEnvelope = (value: unknown): value is CacheEnvelope => {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const record = value as Record<string, unknown>
  return typeof record.savedAtMs === "number" && Number.isFinite(record.savedAtMs) && "body" in record
}

export const readCachedJson = (
  key: string,
  maxAgeMs: number
): Effect.Effect<unknown | null, never> =>
  Effect.tryPromise({
    try: async () => {
      const raw = await readFile(cachePath(key), "utf8")
      const parsed: unknown = JSON.parse(raw)

      if (!isCacheEnvelope(parsed)) {
        return null
      }

      const ageMs = Date.now() - parsed.savedAtMs
      return ageMs <= maxAgeMs ? parsed.body : null
    },
    catch: () => null
  }).pipe(Effect.catchAll(() => Effect.succeed(null)))

export const readAnyCachedJson = (key: string): Effect.Effect<unknown | null, never> =>
  Effect.tryPromise({
    try: async () => {
      const raw = await readFile(cachePath(key), "utf8")
      const parsed: unknown = JSON.parse(raw)
      return isCacheEnvelope(parsed) ? parsed.body : null
    },
    catch: () => null
  }).pipe(Effect.catchAll(() => Effect.succeed(null)))

export const writeCachedJson = (key: string, body: unknown): Effect.Effect<void, never> =>
  Effect.tryPromise({
    try: async () => {
      const path = cachePath(key)
      await mkdir(dirname(path), { recursive: true })
      await writeFile(
        path,
        JSON.stringify(
          {
            savedAtMs: Date.now(),
            body
          } satisfies CacheEnvelope,
          null,
          2
        ),
        "utf8"
      )
    },
    catch: () => undefined
  }).pipe(Effect.catchAll(() => Effect.void))
