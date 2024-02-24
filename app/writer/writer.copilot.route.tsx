// http://localhost:3000/writer

import { json } from "@remix-run/node"
import type { ActionFunctionArgs } from "@remix-run/node"
import { completion } from "./copilot/copilot.server.tsx"
import { cache, cachified } from "#app/cache/cache.server.ts"

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json()

  try {
    const prediction = await cachified({
      cache,
      ttl: 60 * 60 * 24 * 7,
      key: JSON.stringify({
        prefix: body.prefix.trim(),
        suffix: body.suffix.trim(),
        extraContext: body.extraContext.trim(),
      }),
      getFreshValue() {
        return completion(body.prefix, body.suffix, body.extraContext)
      },
      reporter: null,
    })

    return json({ prediction: prediction })
  } catch (error) {
    console.error(error)
    return json(
      { prediction: "" },
      {
        status: 500,
      },
    )
  }
}
