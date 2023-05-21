import * as React from "react"
import {
  json,
  type LinksFunction,
  type LoaderFunction,
  type V2_MetaFunction,
} from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { getMDXComponent } from "mdx-bundler/client"
import invariant from "tiny-invariant"
import type { MdxComponent } from "~/types"

import CodeBlock from "~/components/code-block"
import blogStyles from "app/styles/blog.css"

import { Highlight } from "~/components/Highlight"
import { Tweet } from "~/components/Tweet"
import { Excerpt } from "~/components/Excerpt"
import { SideNote } from "~/components/SideNote"
import { loadMdx } from "~/utils/loadMdx"
import { ButtonLink } from "~/components/ButtonLink"
import { getMdxListItems, getMdxPage } from "~/utils/mdx.server"
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
