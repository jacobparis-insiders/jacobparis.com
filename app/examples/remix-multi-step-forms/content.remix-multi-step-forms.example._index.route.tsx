// http://localhost:3000/content/remix-multi-step-forms/example

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form } from "@remix-run/react"
import { FadeIn } from "./FadeIn.tsx"
import db from "./db.server.ts"

export async function action({ request }: ActionFunctionArgs) {
  db.hasStarted = true

  return redirect("/content/remix-multi-step-forms/example/name")
}

export async function loader({ request }: LoaderFunctionArgs) {
  return json({})
}

export default function Example() {
  return (
    <Form method="post" action="?index" className="text-center">
      <FadeIn className="delay-0">
        <h1 className="mb-6 text-6xl font-bold text-gray-800">
          Multi-step Forms
        </h1>
      </FadeIn>

      <FadeIn className="delay-200">
        <p className="mb-6 text-lg text-gray-600">
          This is an example of a multi step form using Remix.
        </p>
      </FadeIn>

      <FadeIn className="delay-300">
        <button
          type="submit"
          className="min-w-[20ch] rounded bg-indigo-600 px-12 py-3 font-medium text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
        >
          Start
        </button>
      </FadeIn>
    </Form>
  )
}
