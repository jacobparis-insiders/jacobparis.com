// http://localhost:3000/content/remix-markdown-preview/example

import { Transition } from "@headlessui/react"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import type { ShouldRevalidateFunction } from "@remix-run/react"
import {
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import { useCallback, useRef, useState } from "react"
import db from "./db.server.ts"
import { processMarkdownToHtml } from "./markdown.server.ts"
export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const description = formData.get("description") || ""

  const id = params.id as string

  if (!(id in db)) {
    throw redirect("/content/remix-markdown-preview/example")
  }

  const html = processMarkdownToHtml(description.toString().trim())

  db[id].description = description.toString()
  db[id].preview = html.content

  return new Response(html.content, {
    status: 200,
  })
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

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id as string

  if (!(id in db)) {
    throw redirect("/content/remix-markdown-preview/example")
  }

  return json({
    description: db[id].description,
    preview: db[id].preview,
  })
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
}) => {
  if (currentUrl.pathname === nextUrl.pathname) {
    return false
  }

  return true
}

export default function Example() {
  const { description: initialDescription, preview: initialPreview } =
    useLoaderData<typeof loader>() || {}
  const [searchParams] = useSearchParams()
  const [description, setDescription] = useState(initialDescription)
  const fetcher = useFetcher()

  const debouncedCardSubmit = useDebounce(fetcher.submit, 50)

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
          <h1 className="mb-6 text-3xl text-gray-800">New item</h1>
        </FadeIn>

        <FadeIn className="delay-200">
          <p className="mb-8 max-w-prose text-lg text-gray-500">
            Write some markdown and then check the preview tab to see the
            result.
          </p>
        </FadeIn>

        <FadeIn className="delay-300">
          <div className="bg-light mx-auto mb-8 inline-flex w-full max-w-lg flex-col  gap-8 overflow-hidden border border-gray-100 text-left sm:rounded-lg sm:shadow-xl">
            <div className="border-b border-gray-100 px-4 py-2">
              <div className="inline-flex items-center rounded bg-gray-100 px-2">
                <Link
                  to="?tab=edit"
                  replace
                  className={`inline-block rounded-lg px-4 py-1 text-sm transition-colors duration-100 ${
                    searchParams.get("tab") !== "preview"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  Edit
                </Link>

                <Link
                  to="?tab=preview"
                  replace
                  className={`inline-block rounded-lg px-4 py-1 text-sm transition-colors duration-100 ${
                    searchParams.get("tab") === "preview"
                      ? "bg-white text-gray-900  shadow-sm"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  Preview
                </Link>
              </div>
            </div>
            {searchParams.get("tab") === "preview" ? (
              <div>
                <div
                  className="prose px-4 py-2"
                  dangerouslySetInnerHTML={{
                    __html: fetcher.data || initialPreview,
                  }}
                />
                <div className="flex justify-end border-t border-gray-100  px-4 py-3">
                  <button
                    type="submit"
                    className={`rounded px-4 py-2 text-sm text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                      fetcher.state === "submitting"
                        ? "bg-indigo-400"
                        : "bg-indigo-600 hover:bg-indigo-500"
                    }`}
                  >
                    {fetcher.state === "submitting" ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            ) : (
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
                    defaultValue={description || ""}
                    onChange={(e) => setDescription(e.currentTarget.value)}
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
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

export function FadeIn({
  className = "",
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  // className="transition-[opacity,transform] duration-[300ms,500ms]"
  return (
    <Transition
      show={true}
      appear
      enter={`${className} transition-[opacity,transform] ease-out duration-[300ms,500ms]`}
      enterFrom="opacity-0 -translate-y-1"
      enterTo="opacity-100 translate-y-0"
    >
      {children}
    </Transition>
  )
}
