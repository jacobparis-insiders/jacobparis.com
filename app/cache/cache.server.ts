import { remember } from "@epic-web/remember"
import Database from "better-sqlite3"
import {
  cachified as baseCachified,
  lruCacheAdapter,
  verboseReporter,
  type CacheEntry,
  type Cache as CachifiedCache,
  type CachifiedOptions,
  mergeReporters,
} from "cachified"
import fs from "fs"
import LRUCache from "lru-cache"
import invariant from "tiny-invariant"
import { z } from "zod"
import { updatePrimaryCacheValue } from "./cache_.sqlite.route.tsx"
import { getInstanceInfo, getInstanceInfoSync } from "./litefs.server.ts"
import type { PerformanceServerTimings } from "#app/utils/timing.server.ts"
import { cachifiedTimingReporter } from "#app/utils/timing.server.ts"

const CACHE_DATABASE_PATH = process.env.CACHE_DATABASE_PATH

const cacheDb = remember("cacheDb", createDatabase)

function createDatabase(tryAgain = true): Database.Database {
  invariant(
    CACHE_DATABASE_PATH,
    "CACHE_DATABASE_PATH environment variable is required",
  )
  const db = new Database(CACHE_DATABASE_PATH)
  const { currentIsPrimary } = getInstanceInfoSync()
  if (!currentIsPrimary) return db

  try {
    // create cache table with metadata JSON column and value JSON column if it does not exist already
    db.exec(`
			CREATE TABLE IF NOT EXISTS cache (
				key TEXT PRIMARY KEY,
				metadata TEXT,
				value TEXT
			)
		`)
  } catch (error: unknown) {
    fs.unlinkSync(CACHE_DATABASE_PATH)
    if (tryAgain) {
      console.error(
        `Error creating cache database, deleting the file at "${CACHE_DATABASE_PATH}" and trying again...`,
      )
      return createDatabase(false)
    }
    throw error
  }
  return db
}

const lru = remember(
  "lru-cache",
  () => new LRUCache<string, CacheEntry<unknown>>({ max: 5000 }),
)

export const lruCache = lruCacheAdapter(lru)

const cacheEntrySchema = z.object({
  metadata: z.object({
    createdTime: z.number(),
    ttl: z.number().nullable().optional(),
    swr: z.number().nullable().optional(),
  }),
  value: z.unknown(),
})
const cacheQueryResultSchema = z.object({
  metadata: z.string(),
  value: z.string(),
})

export const cache: CachifiedCache = {
  name: "SQLite cache",
  get(key) {
    const result = cacheDb
      .prepare("SELECT value, metadata FROM cache WHERE key = ?")
      .get(key)
    const parseResult = cacheQueryResultSchema.safeParse(result)
    if (!parseResult.success) return null

    const parsedEntry = cacheEntrySchema.safeParse({
      metadata: JSON.parse(parseResult.data.metadata),
      value: JSON.parse(parseResult.data.value),
    })
    if (!parsedEntry.success) return null
    const { metadata, value } = parsedEntry.data
    if (!value) return null
    return { metadata, value }
  },
  async set(key, entry) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const { currentIsPrimary, primaryInstance } = await getInstanceInfo()
    if (currentIsPrimary) {
      cacheDb
        .prepare(
          "INSERT OR REPLACE INTO cache (key, value, metadata) VALUES (@key, @value, @metadata)",
        )
        .run({
          key,
          value: JSON.stringify(entry.value),
          metadata: JSON.stringify(entry.metadata),
        })
    } else {
      // fire-and-forget cache update
      void updatePrimaryCacheValue({
        key,
        cacheValue: entry,
      }).then((response) => {
        if (!response.ok) {
          console.error(
            `Error updating cache value for key "${key}" on primary instance (${primaryInstance}): ${response.status} ${response.statusText}`,
            { entry },
          )
        }
      })
    }
  },
  async delete(key) {
    const { currentIsPrimary, primaryInstance } = await getInstanceInfo()
    if (currentIsPrimary) {
      cacheDb.prepare("DELETE FROM cache WHERE key = ?").run(key)
    } else {
      // fire-and-forget cache update
      void updatePrimaryCacheValue({
        key,
        cacheValue: undefined,
      }).then((response) => {
        if (!response.ok) {
          console.error(
            `Error deleting cache value for key "${key}" on primary instance (${primaryInstance}): ${response.status} ${response.statusText}`,
          )
        }
      })
    }
  },
}

export async function getAllCacheKeys(limit: number) {
  return {
    sqlite: cacheDb
      .prepare("SELECT key FROM cache LIMIT ?")
      .all(limit)
      .map((row) => (row as { key: string }).key),
    lru: [...lru.keys()],
  }
}

export async function searchCacheKeys(search: string, limit: number) {
  return {
    sqlite: cacheDb
      .prepare("SELECT key FROM cache WHERE key LIKE ? LIMIT ?")
      .all(`%${search}%`, limit)
      .map((row) => (row as { key: string }).key),
    lru: [...lru.keys()].filter((key) => key.includes(search)),
  }
}

export async function cachified<Value>({
  serverTimings,
  reporter = verboseReporter(),
  ...options
}: CachifiedOptions<Value> & {
  serverTimings?: PerformanceServerTimings
}): Promise<Value> {
  return baseCachified({
    // Always show the cached version while we fetch a new one
    staleWhileRevalidate: Infinity,

    // In development, always recompile
    forceFresh: process.env.NODE_ENV === "development",

    ...options,
    reporter: mergeReporters(cachifiedTimingReporter(serverTimings), reporter),
  })
}

export function clearKey(key: string) {
  void lru.delete(key)
}
