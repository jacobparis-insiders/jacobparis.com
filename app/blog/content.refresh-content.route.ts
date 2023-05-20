import type { ActionFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { getRequiredEnvVar } from "~/utils/misc"

export const action: ActionFunction = async ({ request }) => {
  if (request.headers.get("auth") !== getRequiredEnvVar("REFRESH_TOKEN")) {
    return json({ message: "Not Authorised" }, { status: 401 })
  }

  const body = await request.text()

  const queryParams = new URLSearchParams()
  queryParams.set("_data", "/content/update-content")

  const response = await fetch(
    `http://localhost:${getRequiredEnvVar("PORT")}/content/update-content`,
    {
      method: "POST",
      body,
      headers: {
        auth: getRequiredEnvVar("REFRESH_TOKEN"),
        "content-type": "application/json",
        "content-length": Buffer.byteLength(body).toString(),
      },
    },
  )

  return json(response)
}
