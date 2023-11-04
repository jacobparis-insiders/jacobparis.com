import { cache, cachified } from "#app/cache/cache.server.ts"
import type { LoaderFunctionArgs } from "@remix-run/node"
import invariant from "tiny-invariant"

import { compileMdx } from "#app/utils/compile-mdx.server.ts"
import { downloadFileBySha } from "#app/utils/github.server.ts"
import { safeEncode } from "~/utils/misc.ts"
import { getServerTiming } from "~/utils/timing.server.ts"
import { getContentList } from "./content.server.ts"
export { mergeHeaders as headers } from "~/utils/misc.ts"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { time, getHeaderField, serverTimings } = getServerTiming()
  const slug = params.slug
  invariant(typeof slug === "string", "Slug should be a string, and defined")

  const { frontmatter, code } = await cachified({
    key: `mdx:${slug}`,
    cache,
    serverTimings,

    forceFresh: false,
    // Always show the cached version while we fetch a new one
    ttl: 1000 * 60 * 60,

    async getFreshValue({ background }) {
      const contentList = await getContentList()

      const content = contentList.find((content) => {
        return content.name.replace(".mdx", "") === slug
      })

      if (!content) {
        throw new Response("Not found", { status: 404 })
      }

      const file = await downloadFileBySha(content.sha)

      const compiled = await compileMdx(
        {
          slug: slug,
          content: file,
        },
        {
          priority: background ? 0 : 1,
        },
      )

      if (!compiled) {
        throw new Error("Failed to compile")
      }

      return {
        code: compiled.code,
        frontmatter: {
          ...compiled.frontmatter,
          slug,
        },
      }
    },
  })

  if (!code) {
    throw new Response("Compilation error", { status: 500 })
  }

  const timestamp = frontmatter.timestamp
  invariant(
    typeof timestamp === "string" || timestamp == undefined,
    "Timestamp should be a string",
  )

  const url = new URL(request.url)
  const ogUrl = new URL("/generators/blog.png", url.origin)
  ogUrl.searchParams.set("title", safeEncode(frontmatter.title))
  ogUrl.searchParams.set("description", safeEncode(frontmatter.description))
  ogUrl.searchParams.set("date", safeEncode(timestamp))
  ogUrl.searchParams.set("img", safeEncode(frontmatter.img))

  const sourceParam = url.searchParams.get("source")
  if (sourceParam) {
    ogUrl.searchParams.set("source", sourceParam)
  }

  const response = await time("image", () => fetch(ogUrl))

  // In https://www.jacobparis.com/content/remix-og I use cachified here
  // But the OG image for that article fetches itself in a smaller window
  // So for that use-case I can't cache these
  return new Response(response.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Server-Timing": getHeaderField(),
    },
  })
}
