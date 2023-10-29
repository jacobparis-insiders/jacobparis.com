// http://localhost:3000/content/remix-crud/example

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, Outlet, useLoaderData } from "@remix-run/react"
import { useState } from "react"
import invariant from "tiny-invariant"
import useLocalStorageState from "use-local-storage-state"
import { FadeIn } from "../FadeIn.tsx"
import { randomUuid } from "../crypto.ts"
import { useResetCallback } from "../useResetCallback.tsx"
import { IssueRow } from "./IssueRow.tsx"
import db from "./db.server.ts"

import { ProgressiveClientOnly } from "../ProgressiveClientOnly.tsx"

export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData()

  const id = params.id as string

  if (!(id in db)) {
    throw redirect("/content/remix-crud/example")
  }

  const title = formData.get("title")
  invariant(title, "Title is required")

  const description = formData.get("description")
  const clientId = formData.get("clientId")
  invariant(clientId, "Client ID is required")

  // delay to make the optimistic UI more noticeable for the example
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
  await wait(300)

  const issueId = db[id].nextId++

  db[id].issues.push({
    createdAt: new Date(),
    updatedAt: new Date(),
    id: issueId,
    title: title.toString(),
    description: description?.toString(),
    clientId: clientId.toString(),
  })

  return json({
    success: true,
    issueId,
    nextId: db[id].nextId,
  })
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id as string

  if (!(id in db)) {
    throw redirect("/content/remix-crud/example")
  }

  return json({
    issues: db[id].issues.map((item) => {
      return {
        ...item,
        idString: String(item.id).padStart(3, "0"),
        date: item.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }
    }),
    nextId: db[id].nextId,
  })
}

type FormElements<U extends string> = HTMLFormControlsCollection &
  Record<U, HTMLInputElement>

export default function Example() {
  const { issues, nextId } = useLoaderData<typeof loader>() || {}

  const [optimisticIssues, setOptimisticIssues] = useState<typeof issues>([])
  useResetCallback(issues, () => {
    setOptimisticIssues([])
  })

  const [clientId, setClientId] = useState(() => randomUuid())
  const [title, setTitle] = useLocalStorageState("new-issue-title", {
    defaultValue: "",
  })
  const [description, setDescription] = useLocalStorageState(
    "new-issue-description",
    {
      defaultValue: "",
    },
  )

  return (
    <div className="mx-auto grid min-h-screen place-items-center">
      <div className="text-center">
        <FadeIn>
          <h1 className="mb-6 text-3xl text-gray-800">
            What do you need to do today?
          </h1>
        </FadeIn>

        <FadeIn className="delay-200">
          <p className="mb-8 max-w-prose text-lg text-gray-500">
            Add important tasks to your list and cross them off, one-by-one!
          </p>
        </FadeIn>

        <FadeIn className="delay-300">
          <div className="mx-auto mb-8 max-w-lg border border-gray-100 text-left ">
            <ul className="divide-y divide-gray-100">
              {issues.map((item) => (
                <IssueRow
                  key={item.clientId}
                  id={item.id}
                  date={item.date}
                  title={item.title}
                />
              ))}

              {optimisticIssues.map((item, index) => (
                <li key={item.clientId}>
                  <span className="relative flex items-center gap-x-4 px-4 py-3 text-sm">
                    <span className="min-w-[4rem] text-gray-400">
                      {String(nextId + index).padStart(3, "0")}
                    </span>{" "}
                    <span className="grow font-medium text-gray-400">
                      {item.title}
                    </span>
                    <span className="text-gray-400"> {item.date}</span>
                  </span>
                </li>
              ))}
            </ul>

            {issues.length + optimisticIssues.length === 0 ? (
              <p className="py-4 text-center text-gray-500">No tasks yet</p>
            ) : null}
          </div>
        </FadeIn>

        <Outlet />

        <ProgressiveClientOnly className="animate-fade">
          <div className="bg-light mx-auto mb-8 inline-flex w-full max-w-lg flex-col  gap-8 overflow-hidden border border-gray-100 text-left sm:rounded-lg sm:shadow-xl">
            <div>
              <Form
                method="POST"
                key={clientId}
                onSubmit={(event) => {
                  const form = event.currentTarget.elements as FormElements<
                    "title" | "description" | "clientId"
                  >

                  setOptimisticIssues((issues) => {
                    const newIssue: typeof issues[number] = {
                      id: nextId,
                      idString: String(nextId).padStart(3, "0"),
                      title: form.title.value,
                      description: form.description.value,
                      date: new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      }),
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      clientId: form.clientId.value,
                    }

                    return [...issues, newIssue]
                  })
                  setTitle("")
                  setDescription("")
                  setClientId(randomUuid())
                }}
              >
                <input type="hidden" name="clientId" value={clientId} />
                <input
                  aria-label="Title"
                  id="title"
                  name="title"
                  placeholder="Issue title"
                  required
                  autoFocus
                  defaultValue={title}
                  onChange={(event) => setTitle(event.currentTarget.value)}
                  className="block w-full border-none bg-transparent px-4 py-2 text-lg font-medium placeholder:text-gray-400 focus:shadow-none focus:outline-none focus:ring-0"
                />

                <textarea
                  aria-label="Description"
                  id="description"
                  name="description"
                  rows={8}
                  defaultValue={description}
                  onChange={(event) =>
                    setDescription(event.currentTarget.value)
                  }
                  placeholder="Add a description…"
                  className="block w-full border-none bg-transparent px-4 py-2 placeholder:text-gray-400 focus:shadow-none focus:outline-none focus:ring-0"
                />

                <div className="flex justify-end border-t border-gray-100  px-4 py-3">
                  <button
                    type="submit"
                    className="w-20 rounded border border-gray-100 bg-white px-4 py-1 text-sm text-gray-600 shadow-sm hover:text-black focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    Save
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </ProgressiveClientOnly>
      </div>
    </div>
  )
}
