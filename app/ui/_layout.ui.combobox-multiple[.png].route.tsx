import type { LoaderFunctionArgs } from "@remix-run/node"

import { safeEncode } from "~/utils/misc.ts"
import { getServerTiming } from "~/utils/timing.server.ts"
import { frontmatter } from "./_layout.ui.combobox-multiple.route.tsx"
export { mergeHeaders as headers } from "~/utils/misc.ts"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { time, getHeaderField } = getServerTiming()

  const url = new URL(request.url)
  const ogUrl = new URL("/generators/ui.png", url.origin)
  ogUrl.searchParams.set("title", safeEncode(frontmatter.title))
  ogUrl.searchParams.set("description", safeEncode(frontmatter.description))
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
