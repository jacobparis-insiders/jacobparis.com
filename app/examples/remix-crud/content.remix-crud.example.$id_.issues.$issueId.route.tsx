// http://localhost:3000/content/remix-crud/example

import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react"
import type { Issue } from "./db.server"
import db from "./db.server"
import {
  Fragment,
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react"
import { Transition } from "@headlessui/react"
import invariant from "tiny-invariant"
import useLocalStorageState from "use-local-storage-state"
import { useHydrated } from "remix-utils"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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

function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        fn(...args)
      }, delay)
    },
    [fn, delay],
  )
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

function useLatestDate<T extends { updatedAt: Date }>(data: T[]) {
  return useMemo(() => {
    const dates = data
      .filter(Boolean)
      .map((data) => new Date(data.updatedAt))
      .sort((a, b) => b.getTime() - a.getTime())

    return dates[0]
  }, [data])
}

export default function Example() {
  const actionData = useActionData<typeof action>()
  const { sessionId, issue } = useLoaderData<typeof loader>() || {}
  const editFetcher = useFetcher()
  const titleFetcher = useFetcher()
  const descriptionFetcher = useFetcher()
  const navigation = useNavigation()

  const updatedAt = useLatestDate([
    issue,
    actionData,
    titleFetcher.data,
    descriptionFetcher.data,
  ])

  const debouncedTitleSubmit = useDebounce(titleFetcher.submit, 500)
  const debouncedDescriptionSubmit = useDebounce(descriptionFetcher.submit, 500)

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
              debouncedTitleSubmit(e.currentTarget.form, { replace: true })
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
              debouncedDescriptionSubmit(e.currentTarget.form, {
                replace: true,
              })
            }}
            placeholder="Add a description…"
            className="block w-full border-none bg-transparent px-4 py-2 text-lg text-gray-700 placeholder:text-gray-400 focus:shadow-none focus:outline-none focus:ring-0"
          />

          <div className="flex items-center justify-end gap-x-2 border-t  border-gray-100 px-4 py-3">
            <AppearWhenHydrated>
              <div className="flex-grow text-sm text-gray-500">
                Last updated{" "}
                {updatedAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </div>
            </AppearWhenHydrated>
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
              className={`w-20 rounded border border-gray-100 px-4 py-1 text-sm text-gray-600 shadow-sm focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                editFetcher.state === "submitting"
                  ? " bg-white text-gray-500"
                  : "bg-white hover:text-black"
              }`}
            >
              Delete
            </button>
          </div>
        </editFetcher.Form>
      </div>

      {/* 
        <FadeIn className="delay-300">
          <div className="bg-light mx-auto mb-8 inline-flex w-full max-w-lg flex-col  gap-8 overflow-hidden border border-gray-100 text-left sm:rounded-lg sm:shadow-xl">
            <div>
              <fetcher.Form
                method="POST"
                onChange={(e) => {
                  debouncedCardSubmit(e.currentTarget, { replace: true })
                }}
              >
                <textarea
                  aria-label="Description"
                  id="description"
                  name="description"
                  rows={8}
                  placeholder="Add a description…"
                  className="block w-full border-none bg-transparent px-4 py-2 placeholder:text-gray-400 focus:shadow-none focus:outline-none focus:ring-0"
                />

                <div className="flex justify-end border-t border-gray-100  px-4 py-3">
                  <button
                    type="submit"
                    className={`w-20 rounded border border-gray-100 px-4 py-1 text-sm text-gray-600 shadow-sm focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                      fetcher.state === "submitting"
                        ? " bg-white text-gray-500"
                        : "bg-white hover:text-black"
                    }`}
                  >
                    {fetcher.state === "submitting" ? "Saving…" : "Save"}
                  </button>
                </div>
              </fetcher.Form>
            </div>
          </div>
        </FadeIn> */}
    </div>
  )
}

export function FadeIn({
  className = "",
  show = true,
  children,
}: {
  className?: string
  show?: boolean
  children: React.ReactNode
}) {
  // className="duration-0 transition-[opacity,transform] duration-[300ms,500ms]"
  return (
    <Transition
      show={show}
      appear
      as={Fragment}
      enter={`${className} transition-[opacity,transform] ease-out duration-[300ms,500ms]`}
      enterFrom="opacity-0 -translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="duration-0"
    >
      {children}
    </Transition>
  )
}

function AppearWhenHydrated({ children }: { children: React.ReactNode }) {
  const isHydrated = useHydrated()
  return (
    <Transition
      show={isHydrated}
      appear
      as={Fragment}
      enter="transition-opacity ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="duration-0"
    >
      {children}
    </Transition>
  )
}
