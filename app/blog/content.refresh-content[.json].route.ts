import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { getContentState } from "~/models/content-state.server"

export const loader: LoaderFunction = async () => {
  const rows = await getContentState()
  const data = rows || {}

  return json(data, {
    headers: {
      "content-length": Buffer.byteLength(JSON.stringify(data)).toString(),
    },
  })
}
