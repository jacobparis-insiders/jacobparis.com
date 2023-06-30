import { redirect, type LoaderFunction } from "@remix-run/node"
import invariant from "tiny-invariant"
import { setContentSHA } from "~/models/content-state.server"
import { setRequiresUpdate } from "~/models/content.server"

import { getMdxListItems } from "~/utils/mdx.server"
export { mergeHeaders as headers } from "~/utils/misc"

export const loader: LoaderFunction = async ({ request, params }) => {
  const slug = params.slug
  invariant(typeof slug === "string", "Slug should be a string, and defined")

  await setRequiresUpdate({ slug, contentDirectory: "blog" })
  await getMdxListItems({ contentDirectory: "blog" })
  await setContentSHA("HEAD")

  return redirect(`/content/${slug}`, {
    status: 303,
    headers: {
      "X-Robots-Tag": "noindex",
    },
  })
}
