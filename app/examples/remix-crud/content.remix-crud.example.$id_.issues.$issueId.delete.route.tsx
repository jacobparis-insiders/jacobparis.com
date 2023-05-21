// http://localhost:3000/examples/remix-crud

import type { ActionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import db from "./db.server"

export async function action({ params }: ActionArgs) {
  const id = params.id as string

  if (!(id in db)) {
    throw redirect("/examples/remix-crud")
  }

  const issueId = params.issueId as string
  const issue = db[id].issues.find((item) => item.id === Number(issueId))
  if (!issue) {
    throw new Response("Not found", { status: 404 })
  }

  db[id].issues = db[id].issues.filter((item) => item.id !== Number(issueId))

  return redirect(`/examples/remix-crud/${id}`)
}
