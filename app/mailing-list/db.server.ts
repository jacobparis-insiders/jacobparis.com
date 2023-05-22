import LRUCache from "lru-cache"
declare global {
  var __emailSubscribeCache: LRUCache<string, boolean>
}

if (!global.__emailSubscribeCache) {
  global.__emailSubscribeCache = new LRUCache({
    max: 500,
    maxSize: 5000,
    sizeCalculation: (value, key) => {
      return 1
    },

    ttl: 1000 * 60 * 60 * 24,
  })
}

export default global.__emailSubscribeCache
