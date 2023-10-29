import { cache, cachified } from "#app/cache/cache.server.ts"
import { compileMdx } from "#app/utils/compile-mdx.server.ts"
import { downloadFileBySha } from "#app/utils/github.server.ts"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import invariant from "tiny-invariant"

import { getContentList } from "./content.server.ts"
import { MdxSchema } from "./_layout.content._index.route.tsx"
export { mergeHeaders as headers } from "~/utils/misc.ts"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const slug = params.slug
  invariant(typeof slug === "string", "Slug should be a string, and defined")

  const compiledMdx = await cachified({
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

        forceFresh: true,

        async getFreshValue() {
          return downloadFileBySha(content.sha)
        },
      })

      return compileMdx({
        slug: slug,
        content: file,
      }).then((compiled) => {
        compiled.frontmatter.slug = slug
        return compiled
      })
    },
  })

  if (!compiledMdx.code) {
    throw new Response("Compilation error", { status: 500 })
  }

  return redirect(`/content/${slug}`, {
    status: 303,
    headers: {
      "X-Robots-Tag": "noindex",
    },
  })
}
