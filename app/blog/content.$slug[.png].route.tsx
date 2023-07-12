import {
  json,
  type LoaderFunction,
} from "@remix-run/node"
import invariant from "tiny-invariant"


import { getMdxPage } from "~/utils/mdx.server"
import { safeEncode } from "~/utils/misc"
import { getServerTiming } from "~/utils/timing.server"
export { mergeHeaders as headers } from "~/utils/misc"

export const loader: LoaderFunction = async ({ request, params }) => {
  const { time, getHeaderField } = getServerTiming()
  const slug = params.slug
  invariant(typeof slug === "string", "Slug should be a string, and defined")

  const data = await time("mdx", () =>
    getMdxPage({ contentDirectory: "blog", slug }),
  )

  if (!data) {
    throw json({ error: "Not found" }, { status: 404 })
  }

  const timestamp = data.frontmatter.timestamp
  invariant(
    typeof timestamp === "string" || timestamp == undefined,
    "Timestamp should be a string",
  )

  const url = new URL(request.url)
  const ogUrl = new URL("/generators/blog.png", url.origin)
  ogUrl.searchParams.set("title", safeEncode(data.title))
  ogUrl.searchParams.set("description", safeEncode(data.description))
  ogUrl.searchParams.set("date", safeEncode(timestamp))
  ogUrl.searchParams.set("img", safeEncode(data.img))

  const response = await time("image", () => fetch(ogUrl))

  return new Response(response.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Server-Timing": getHeaderField(),
    },
  })
}
