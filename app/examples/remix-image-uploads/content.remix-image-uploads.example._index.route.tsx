// http://localhost:3000/content/remix-image-uploads/example

import { Transition } from "@headlessui/react"
import type { ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form } from "@remix-run/react"
import { randomUuid } from "../crypto.ts"
import db from "./db.server.ts"

export async function action({ params, request }: ActionFunctionArgs) {
  const id = randomUuid()

  db[id] = {
    draft: {
      id: randomUuid(),
      body: "",
      files: [],
    },
    messages: [],
  }

  return redirect(`/content/remix-image-uploads/example/${id}`)
}

export default function Example() {
  return (
    <div className="mx-auto grid min-h-screen place-items-center">
      <Form method="post" action="?index" className="text-center">
        <FadeIn className="delay-0">
          <h1 className="mb-6 px-4 text-6xl font-bold text-gray-800">
            Remix Image Upload Example
          </h1>
        </FadeIn>

        <FadeIn className="delay-200">
          <p className="mb-6 px-4 text-lg text-gray-600">
            Upload a file and it will be saved to the server.
          </p>
        </FadeIn>

        <FadeIn className="delay-300">
          <button
            type="submit"
            className="min-w-[20ch] rounded bg-indigo-600 px-12 py-3 font-medium text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            Get started
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
