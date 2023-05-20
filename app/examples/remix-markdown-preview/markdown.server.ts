import Lrucache from "lru-cache"

const cache = new Lrucache({
  ttl: 1000 * 60,
  maxSize: 1024,
  sizeCalculation: (value) => Buffer.byteLength(JSON.stringify(value)),
})

function cachify<TArgs, TReturn>(fn: (args: TArgs) => TReturn) {
  return function (args: TArgs): TReturn {
    if (cache.has(args)) {
      return cache.get(args) as TReturn
    }
    const result = fn(args)
    cache.set(args, result)
    return result
  }
}

// Replace with a parser that works on Mac
function processMarkdownToHtmlImpl(markdown: string) {
  return {
    content: markdown,
  }
}
export const processMarkdownToHtml = cachify(processMarkdownToHtmlImpl)
