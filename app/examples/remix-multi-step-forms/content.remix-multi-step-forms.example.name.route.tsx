// http://localhost:3000/content/remix-multi-step-forms/example

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"

import invariant from "tiny-invariant"
import { FadeIn } from "./FadeIn.tsx"
import db from "./db.server.ts"

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const firstName = formData.get("firstName")
  invariant(firstName)
  const lastName = formData.get("lastName")
  invariant(lastName)

  db.firstName = firstName.toString()
  db.lastName = lastName.toString()

  return redirect("/content/remix-multi-step-forms/example/email")
}

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    firstName: db.firstName,
    lastName: db.lastName,
  })
}

export default function Example() {
  const { firstName, lastName } = useLoaderData<typeof loader>() || {}

  return (
    <div>
      <Form method="post">
        <div className="text-center">
          <FadeIn className="delay-0">
            <h1 className="mb-6 text-3xl text-gray-800">What is your name?</h1>
          </FadeIn>

          <FadeIn className="delay-200">
            <p className="mb-8 text-left text-lg text-gray-500">
              We'll use this information to personalize your experience while
              you use the app.
            </p>
          </FadeIn>

          <FadeIn className="delay-300">
            <div className="mx-auto inline-flex flex-col gap-8  rounded-lg border border-gray-100 px-8 py-6 text-left shadow-xl">
              <div className="flex gap-x-8">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block font-medium text-gray-600"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    defaultValue={firstName}
                    className="block w-full rounded border border-gray-300 px-4 py-3 focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block font-medium text-gray-600"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    defaultValue={lastName}
                    className="block w-full rounded border border-gray-300 px-4 py-3 focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                >
                  Continue
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </Form>
    </div>
  )
}
