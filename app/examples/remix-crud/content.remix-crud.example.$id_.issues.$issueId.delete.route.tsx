// http://localhost:3000/content/remix-crud/example

import type { ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import db from "./db.server.ts"

export async function action({ params }: ActionFunctionArgs) {
  const id = params.id as string

  if (!(id in db)) {
    throw redirect("/content/remix-crud/example")
  }

  const issueId = params.issueId as string
  const issue = db[id].issues.find((item) => item.id === Number(issueId))
  if (!issue) {
    throw new Response("Not found", { status: 404 })
  }

  db[id].issues = db[id].issues.filter((item) => item.id !== Number(issueId))

  return redirect(`/content/remix-crud/example/${id}`)
}
