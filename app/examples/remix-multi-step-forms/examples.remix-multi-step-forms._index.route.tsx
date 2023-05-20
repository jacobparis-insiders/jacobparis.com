// http://localhost:3000/examples/remix-multi-step-forms

import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form } from "@remix-run/react"
import db from "./db.server"
import { FadeIn } from "./FadeIn"

export async function action({ request }: ActionArgs) {
  db.hasStarted = true

  return redirect("/examples/remix-multi-step-forms/name")
}

export async function loader({ request }: LoaderArgs) {
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
