// http://localhost:3000/content/remix-crud/example

import type { ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form } from "@remix-run/react"
import type { Issue } from "./db.server.ts"
import db from "./db.server.ts"
import { randomUuid } from "../crypto.ts"
import { FadeIn } from "../FadeIn.tsx"

export async function action({ params, request }: ActionFunctionArgs) {
  const id = randomUuid()

  db[id] = {
    issues: Array<Issue>(),
    nextId: 1,
  }

  return redirect(`/content/remix-crud/example/${id}`)
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
            Work with data in an optimistic and persistent UI.
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
