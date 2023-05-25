// http://localhost:3000/content/remix-crud/example

import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useActionData, useFetcher, useLoaderData } from "@remix-run/react"
import db from "./db.server"
import invariant from "tiny-invariant"
import { useDebounceFetcher } from "../useDebounceFetcher"
import { LastUpdated } from "./LastUpdated"

export async function action({ params, request }: ActionArgs) {
  const formData = await request.formData()

  const id = params.id as string

  if (!(id in db)) {
    throw redirect("/content/remix-crud/example")
  }

  const issueId = params.issueId as string
  const issue = db[id].issues.find((item) => item.id === Number(issueId))
  if (!issue) {
    throw new Response("Not found", { status: 404 })
  }

  const title = formData.get("title")
  invariant(title, "Title is required")

  const description = formData.get("description")

  issue.title = title.toString()
  issue.description = description?.toString()
  issue.updatedAt = new Date()

  const shouldClose = formData.get("close")
  if (shouldClose) {
    return redirect(`/content/remix-crud/example/${id}`)
  }

  return json({ success: true, issueId, updatedAt: issue.updatedAt })
}

export async function loader({ params }: LoaderArgs) {
  const id = params.id as string

  if (!(id in db)) {
    throw redirect("/content/remix-crud/example")
  }

  const issueId = params.issueId as string

  const issue = db[id].issues.find((item) => item.id === Number(issueId))
  if (!issue) {
    throw new Response("Not found", { status: 404 })
  }

  return json({
    sessionId: id,
    issue: {
      ...issue,
      idString: String(issue.id).padStart(3, "0"),
      date: issue.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    },
  })
}

export default function Example() {
  const actionData = useActionData<typeof action>()
  const { sessionId, issue } = useLoaderData<typeof loader>() || {}
  const editFetcher = useFetcher()
  const titleFetcher = useDebounceFetcher()
  const descriptionFetcher = useDebounceFetcher()

  return (
    <div>
      <div>
        <editFetcher.Form key={issue.id} method="POST">
          <input
            aria-label="Title"
            id="title"
            name="title"
            placeholder="Issue title"
            required
            defaultValue={issue.title}
            onChange={(e) => {
              const form = e.currentTarget.form
              if (!form?.title) return

              titleFetcher.debounceSubmit(form, {
                replace: true,
                debounceTimeout: 500,
              })
            }}
            onBlur={(e) => {
              const form = e.currentTarget.form
              if (!form?.title) return

              titleFetcher.debounceSubmit(form, {
                replace: true,
              })
            }}
            className="block w-full border-none bg-transparent px-4 py-2 text-2xl font-medium placeholder:text-gray-400 focus:shadow-none focus:outline-none focus:ring-0"
          />

          <textarea
            aria-label="Description"
            id="description"
            name="description"
            rows={8}
            defaultValue={issue.description}
            onChange={(e) => {
              descriptionFetcher.debounceSubmit(e.currentTarget.form, {
                replace: true,
                debounceTimeout: 500,
              })
            }}
            onBlur={(e) => {
              descriptionFetcher.debounceSubmit(e.currentTarget.form, {
                replace: true,
              })
            }}
            placeholder="Add a description…"
            className="block w-full border-none bg-transparent px-4 py-2 text-lg text-gray-700 placeholder:text-gray-400 focus:shadow-none focus:outline-none focus:ring-0"
          />

          <div className="flex items-center justify-end gap-x-2 border-t  border-gray-100 px-4 py-3">
            <LastUpdated
              className="flex-grow text-sm text-gray-500"
              dateStrings={[
                issue.updatedAt,
                actionData?.updatedAt,
                descriptionFetcher.data?.updatedAt,
                titleFetcher.data?.updatedAt,
              ]}
            />

            <button
              type="submit"
              name="close"
              value="true"
              className={`w-20 rounded border border-gray-100 px-4 py-1 text-sm text-gray-600 shadow-sm focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                editFetcher.state === "submitting"
                  ? " bg-white text-gray-500"
                  : "bg-white hover:text-black"
              }`}
            >
              {editFetcher.state === "submitting" ? "Saving…" : "Done"}
            </button>
            <button
              type="submit"
              formAction={`/content/remix-crud/example/${sessionId}/issues/${issue.id}/delete`}
              className={`w-20 rounded border border-gray-100 bg-white px-4 py-1 text-sm text-gray-600 shadow-sm hover:text-black focus:ring-2 focus:ring-black focus:ring-offset-2`}
            >
              Delete
            </button>
          </div>
        </editFetcher.Form>
      </div>
    </div>
  )
}
