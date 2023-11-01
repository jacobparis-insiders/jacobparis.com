// http://localhost:3000/content/remix-multi-step-forms/example

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"

import invariant from "tiny-invariant"
import { FadeIn } from "./FadeIn.tsx"
import db from "./db.server.ts"

export async function action(args: ActionFunctionArgs) {
  const formData = await args.request.clone().formData()

  const _action = formData.get("_action")
  invariant(_action)

  if (_action === "CONTINUE") {
    return continueAction(args)
  }

  throw new Error(`Unknown action ${_action}`)
}

async function continueAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = formData.get("email")
  invariant(email)

  db.email = email.toString()
  db.sawNewsletterOffer = true

  return redirect("/content/remix-multi-step-forms/example/name")
}

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    hasStarted: db.hasStarted,
    firstName: db.firstName,
    lastName: db.lastName,
    email: db.email,
    sawNewsletterOffer: db.sawNewsletterOffer,
  })
}

export default function Example() {
  const { hasStarted, firstName, lastName, email, sawNewsletterOffer } =
    useLoaderData<typeof loader>() || {}

  return (
    <div>
      <Form method="post">
        <div className="text-center">
          <FadeIn className="delay-0">
            <h1 className="mb-6 text-3xl text-gray-800">That's all for now!</h1>
          </FadeIn>

          <FadeIn className="delay-200">
            <p className="mb-8 max-w-prose text-left text-lg text-gray-500">
              You have
              <ul className="mb-4 ml-8 list-disc">
                {hasStarted ? <li> started the form </li> : null}
                {firstName || lastName ? (
                  <li>
                    set your name to{" "}
                    {[firstName, lastName].filter(Boolean).join(" ")}{" "}
                  </li>
                ) : null}
                {sawNewsletterOffer ? (
                  email ? (
                    <li> subscribed to the newsletter as {email} </li>
                  ) : (
                    <li> skipped the newsletter offer </li>
                  )
                ) : null}
              </ul>
              You can now go back to the{" "}
              <Link
                to="/content/remix-multi-step-forms"
                className="text-sky-600 hover:text-sky-500"
              >
                implementation guide
              </Link>{" "}
              or the start of this flow.
            </p>
          </FadeIn>

          <FadeIn className="delay-300">
            <Link
              to="/content/remix-multi-step-forms/example"
              className="min-w-[20ch] rounded bg-indigo-600 px-12 py-3 font-medium text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              Back to start
            </Link>
          </FadeIn>
        </div>
      </Form>
    </div>
  )
}
