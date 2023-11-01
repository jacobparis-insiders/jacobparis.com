import { cache, cachified } from "#app/cache/cache.server.ts"
import { compileMdx } from "#app/utils/compile-mdx.server.ts"
import { downloadFileBySha } from "#app/utils/github.server.ts"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import invariant from "tiny-invariant"

import { getContentList } from "./content.server.ts"
export { mergeHeaders as headers } from "~/utils/misc.ts"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const slug = params.slug
  invariant(typeof slug === "string", "Slug should be a string, and defined")

  const { code } = await cachified({
    key: `mdx:${slug}`,
    cache,

    forceFresh: true,
    ttl: 1000 * 60 * 60,

    async getFreshValue() {
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
          priority: 2,
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

  return redirect(`/content/${slug}`, {
    status: 303,
    headers: {
      "X-Robots-Tag": "noindex",
    },
  })
}
