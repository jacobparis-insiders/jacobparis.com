import type { LoaderFunctionArgs } from "@remix-run/node"
import { createRect, hashStringToColor } from "./createRect.ts"

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const width = parseInt(url.searchParams.get("width") || "585", 10)
  const height = parseInt(url.searchParams.get("height") || "1266 ", 10)
  const inputString =
    url.searchParams.get("hash") || new Date().toISOString().split("T")[0]
  const color = hashStringToColor(inputString)

  const pngBuffer = createRect(width, height, color)

  return new Response(pngBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Length": pngBuffer.length.toString(),
      "Cache-Control": "no-cache",
    },
  })
}
