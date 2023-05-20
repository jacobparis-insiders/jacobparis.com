// http://localhost:3000/examples/remix-crud

import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { ShouldRevalidateFunction, useParams } from "@remix-run/react"
import {
  Await,
  Form,
  Link,
  Outlet,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react"
import db from "./db.server"
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Transition } from "@headlessui/react"
import invariant from "tiny-invariant"
import { randomUuid } from "./crypto"
import useLocalStorageState from "use-local-storage-state"
import { useHydrated } from "remix-utils"
import { PencilIcon, TrashIcon } from "@heroicons/react/20/solid"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function action({ params, request }: ActionArgs) {
  const formData = await request.formData()

  const id = params.id as string

  if (!(id in db)) {
    throw redirect("/examples/remix-crud")
  }

  const title = formData.get("title")
  invariant(title, "Title is required")

  const description = formData.get("description")
  const clientId = formData.get("clientId")
  invariant(clientId, "Client ID is required")

  await wait(5000)

  const issueId = db[id].nextId++

  db[id].issues.push({
    createdAt: new Date(),
    updatedAt: new Date(),
    id: issueId,
    title: title.toString(),
    description: description?.toString(),
    clientId: clientId.toString(),
  })

  return json({ success: true, issueId, nextId: db[id].nextId })
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
    throw redirect("/examples/remix-crud")
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

function useOptimisticState<T extends Array<any>>(actualState: T) {
  const [state, setState] = useState<T>([] as unknown as T)
  const [prev, setPrev] = useState(actualState)
  if (actualState !== prev) {
    setPrev(actualState)
    setState([] as unknown as T)
  }
  return [state, setState] as const
}

export default function Example() {
  const { issues, nextId } = useLoaderData<typeof loader>() || {}
  const [clientId, setClientId] = useState(() => randomUuid())

  const [optimisticIssues, setOptimisticIssues] = useOptimisticState(issues)

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
      <style>
        {
          /* css */ `
        .bg-light {
          backdrop-filter: blur(1.5rem) saturate(200%) contrast(50%) brightness(130%);
          background-color: rgba(255, 255, 255, 0.5);
        }`
        }
      </style>
      <div className="text-center">
        <FadeIn className="delay-0">
          <h1 className="mb-6 text-3xl text-gray-800">
            What do you need to do today?
          </h1>
        </FadeIn>

        <FadeIn className="delay-200">
          <p className="mb-8 max-w-prose text-lg text-gray-500">
            Add important tasks to your list and cross them off, one-by-one!
          </p>
        </FadeIn>
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
                  <span className="min-w-[4rem] text-gray-600">
                    {String(nextId + index).padStart(3, "0")}
                  </span>{" "}
                  <span className="grow font-medium text-gray-800">
                    {item.title}
                  </span>
                  <span className="text-gray-600"> {item.date}</span>
                </span>
              </li>
            ))}
          </ul>

          {issues.length + optimisticIssues.length === 0 ? (
            <p className="py-4 text-center text-gray-500">No tasks yet</p>
          ) : null}
        </div>

        <Outlet />

        <Suspense>
          <FadeIn className="delay-300">
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
                      const newIssue = {
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
                      className={`hover:text-black} w-20 rounded border border-gray-100 bg-white px-4 py-1 text-sm text-gray-600 shadow-sm focus:ring-2 focus:ring-black focus:ring-offset-2`}
                    >
                      {"Save"}
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          </FadeIn>
        </Suspense>

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
      enter={`${className} transition-[opacity,transform] ease-out duration-[300ms,500ms]`}
      enterFrom="opacity-0 -translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="duration-0"
    >
      {children}
    </Transition>
  )
}

function IssueRow(item: { id: number; title: string; date: string }) {
  const idString = String(item.id).padStart(3, "0")
  const fetcher = useFetcher()
  const params = useParams()
  const [isDeleting, setIsDeleting] = useState(false)

  return isDeleting ? null : (
    <li className="group relative hover:bg-gray-50">
      <Link
        prefetch="intent"
        to={`issues/${item.id}`}
        className="flex items-center gap-x-4 px-4 py-3 text-sm"
      >
        <span className="min-w-[4rem] text-gray-600">{idString}</span>{" "}
        <span className="grow font-medium text-gray-800">{item.title}</span>
        <span className="text-gray-600"> {item.date}</span>
      </Link>

      <fetcher.Form
        onSubmit={(event) => {
          const submitButton = event.submitter
          const form = event.currentTarget

          console.log(fetcher.submission?.action)
          if (fetcher.submission?.action.endsWith("/delete")) {
            setIsDeleting(true)
          }
        }}
        className="bg-light absolute -right-2 -top-2 hidden rounded-sm border border-gray-100 shadow group-focus-within:flex group-hover:flex group-focus:flex"
      >
        <button className="inline-block rounded p-1 text-gray-700 hover:bg-gray-100 hover:text-black">
          <span className="sr-only">Edit issue</span>
          <PencilIcon className="h-5 w-5" />
        </button>

        <button
          type="submit"
          formMethod="POST"
          formAction={`/examples/remix-crud/${params.id}/issues/${item.id}/delete`}
          // onClick={() => {
          //   setIsDeleting(true)
          // }}
          className="inline-block rounded p-1 text-gray-700 hover:bg-gray-100 hover:text-black"
        >
          <span className="sr-only">Delete issue</span>
          <TrashIcon className="h-5 w-5" />
        </button>
      </fetcher.Form>
    </li>
  )
}
