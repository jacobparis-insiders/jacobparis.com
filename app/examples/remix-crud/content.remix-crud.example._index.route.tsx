// http://localhost:3000/examples/remix-crud

import type { ActionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form } from "@remix-run/react"
import type { Issue } from "./db.server"
import db from "./db.server"
import { Transition } from "@headlessui/react"
import crypto from "crypto"

export async function action({ params, request }: ActionArgs) {
  const id = crypto.randomUUID()

  db[id] = {
    issues: Array<Issue>(),
    nextId: 1,
  }

  return redirect(`/examples/remix-crud/${id}`)
}

export default function Example() {
  return (
    <div className="mx-auto grid min-h-screen place-items-center">
      <Form method="post" action="?index" className="text-center">
        <FadeIn className="delay-0">
          <h1 className="mb-6 px-4 text-6xl font-bold text-gray-800">
            Modern CRUD with Remix
          </h1>
        </FadeIn>

        <FadeIn className="delay-200">
          <p className="mb-6 px-4 text-lg text-gray-600">
            Users don't like to lose their data.
          </p>
        </FadeIn>

        <FadeIn className="delay-300">
          <button
            type="submit"
            className="min-w-[20ch] rounded bg-indigo-600 px-12 py-3 font-medium text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            New item
          </button>
        </FadeIn>
      </Form>
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
// bash script to loop through every file in the cwd and rename them to have .route before their file extension
// for f in *; do mv "$f" "${f%.*}.route.${f##*.}"; done
