import { cache, cachified } from "#app/cache/cache.server.ts"
import { type LoaderFunction } from "@remix-run/node"
import invariant from "tiny-invariant"

import { compileMdx } from "#app/utils/compile-mdx.server.ts"
import { downloadFileBySha } from "#app/utils/github.server.ts"
import { safeEncode } from "~/utils/misc.ts"
import { getServerTiming } from "~/utils/timing.server.ts"
import { MdxSchema } from "./_layout.content._index.route.tsx"
import { getContentList } from "./content.server.ts"
export { mergeHeaders as headers } from "~/utils/misc.ts"

export const loader: LoaderFunction = async ({ request, params }) => {
  const { time, getHeaderField } = getServerTiming()
  const slug = params.slug
  invariant(typeof slug === "string", "Slug should be a string, and defined")

  const data = await cachified({
    key: `mdx:compiled:${slug}`,
    cache,
    checkValue: MdxSchema,

    // Always show the cached version while we fetch a new one
    ttl: 1000 * 60 * 60,
    staleWhileRevalidate: Infinity,

    // In development, always recompile
    forceFresh: process.env.NODE_ENV === "development",
    async getFreshValue() {
      const contentList = await getContentList()

      const content = contentList.find((content) => {
        return content.name.replace(".mdx", "") === slug
      })

      if (!content) {
        throw new Response("Not found", { status: 404 })
      }

      const file = await cachified({
        key: `github:file:${slug}`,
        cache,

        // Always show the cached version while we fetch a new one
        ttl: 1000 * 60 * 60,
        staleWhileRevalidate: Infinity,

        // In development, always recompile
        forceFresh: process.env.NODE_ENV === "development",

        async getFreshValue() {
          return downloadFileBySha(content.sha)
        },
      })

      return compileMdx({
        slug: slug,
        content: file,
      })
    },
  })

  if (!data.code) {
    throw new Response("Compilation error", { status: 500 })
  }

  const timestamp = data.frontmatter.timestamp
  invariant(
    typeof timestamp === "string" || timestamp == undefined,
    "Timestamp should be a string",
  )

  const url = new URL(request.url)
  const ogUrl = new URL("/generators/blog.png", url.origin)
  ogUrl.searchParams.set("title", safeEncode(data.frontmatter.title))
  ogUrl.searchParams.set(
    "description",
    safeEncode(data.frontmatter.description),
  )
  ogUrl.searchParams.set("date", safeEncode(timestamp))
  ogUrl.searchParams.set("img", safeEncode(data.frontmatter.img))

  const response = await time("image", () => fetch(ogUrl))

  return new Response(response.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Server-Timing": getHeaderField(),
    },
  })
}
