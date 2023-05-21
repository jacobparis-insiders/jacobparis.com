// http://localhost:3000/content/remix-autosave-form/example

import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import db from "./db.server"
export async function action({ params, request }: ActionArgs) {
  const formData = await request.formData()
  const email = formData.get("email")
  if (email) {
    db.email = email.toString()
  }

  const name = formData.get("name")
  if (name) {
    db.name = name.toString()
  }

  return new Response(null, {
    status: 200,
  })
}

export async function loader({ request }: LoaderArgs) {
  return json({
    email: db.email,
    name: db.name,
  })
}

export default function Example() {
  const { email, name } = useLoaderData<typeof loader>() || {}
  const fetcher = useFetcher()

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
        <h1 className="mb-6 text-3xl text-gray-800">Profile information</h1>

        <p className="mb-8 max-w-prose text-lg text-gray-500">
          Add your personal details. This form will save automatically.
        </p>

        <fetcher.Form
          method="post"
          onBlur={(e) => fetcher.submit(e.currentTarget, { replace: true })}
        >
          <div className="bg-light  mx-auto mb-8 inline-flex w-full max-w-lg flex-col  gap-8 overflow-hidden rounded-lg border border-gray-100 text-left shadow-xl">
            <div className="flex flex-col gap-4 px-8 py-6">
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
                  defaultValue={email || ""}
                  className="block w-96 rounded border border-gray-300 px-4 py-3 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block font-medium text-gray-600"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={name || ""}
                  className="block w-96 rounded border border-gray-300 px-4 py-3 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

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
        </fetcher.Form>
      </div>
    </div>
  )
}
