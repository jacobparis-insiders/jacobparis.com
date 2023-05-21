// http://localhost:3000/content/remix-multi-step-forms/example

import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"

import invariant from "tiny-invariant"
import { action as subscribeAction } from "~/mailing-list/emails.subscribe.route"
import db from "./db.server"
import { FadeIn } from "./FadeIn"

export async function action(args: ActionArgs) {
  const formData = await args.request.clone().formData()

  const _action = formData.get("_action")
  invariant(_action)

  if (_action === "SUBSCRIBE") {
    const email = formData.get("email")
    invariant(email)

    db.email = email.toString()
    db.sawNewsletterOffer = true

    return subscribeAction(args)
  }

  if (_action === "CONTINUE") {
    db.sawNewsletterOffer = true

    return redirect("/content/remix-multi-step-forms/example/complete")
  }

  throw new Error(`Unknown action ${_action}`)
}

export async function loader({ request }: LoaderArgs) {
  return json({
    email: db.email,
  })
}

export default function Example() {
  const { email } = useLoaderData<typeof loader>() || {}

  return (
    <div>
      <div className="text-center">
        <FadeIn className="delay-0">
          <h1 className="mb-6 text-3xl text-gray-800">
            Get the latest updates
          </h1>
        </FadeIn>

        <FadeIn className="delay-200">
          <p className="mb-8 max-w-prose text-lg text-gray-500">
            By providing your email, you agree to receive updates and offers
            about new content, products, and services from Jacob Paris
          </p>
        </FadeIn>

        <FadeIn className="delay-300">
          <Form method="post">
            <div className="mx-auto mb-8 inline-flex flex-col gap-8  rounded-lg border border-gray-100 px-8 py-6 text-left shadow-xl">
              <div className="flex gap-x-8">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block font-medium text-gray-600"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={email}
                    className="block w-96 rounded border border-gray-300 px-4 py-3 focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  name="_action"
                  value="SUBSCRIBE"
                  className="rounded bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </Form>
        </FadeIn>

        <FadeIn className="delay-300">
          <Form method="post">
            <button
              type="submit"
              name="_action"
              value="CONTINUE"
              className="min-w-[20ch] rounded bg-transparent px-12 py-3 font-medium text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              Continue without subscribing
            </button>
          </Form>
        </FadeIn>
      </div>
    </div>
  )
}
