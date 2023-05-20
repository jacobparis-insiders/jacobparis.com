import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { getMdxPage } from "~/utils/mdx.server"
import type { MdxComponent } from "~/types"

export async function loadMdx(slug: string) {
  const mdxPage = await getMdxPage({ contentDirectory: "blog", slug })

  if (!mdxPage) {
    throw json({ error: "Not found" }, { status: 404 })
  }

  return json<MdxComponent>(mdxPage, {
    headers: { "cache-control": "private, max-age: 60", Vary: "Cookie" },
  })
}
