import { cache, cachified } from "#app/cache/cache.server.ts"
import { downloadDirectoryList } from "#app/utils/github.server.ts"

export async function getContentList() {
  return cachified({
    key: "github:content",
    cache,
    ttl: 1000 * 60,
    staleWhileRevalidate: 1000 * 60 * 60 * 24,
    async getFreshValue() {
      return downloadDirectoryList("content/blog")
    },
  })
}
