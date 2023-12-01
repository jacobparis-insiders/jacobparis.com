// http://localhost:3000/content/remix-conform-autosave/example

import { conform, useForm } from "@conform-to/react"
import { getFieldsetConstraint, parse } from "@conform-to/zod"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useActionData, useLoaderData } from "@remix-run/react"
import { z } from "zod"
import { useDebounceFetcher } from "remix-utils/use-debounce-fetcher"
import db from "./db.server.ts"

const schema = z.object({
  email: z.string().email(),
  name: z.string(),
})

export async function action({ request, params }: ActionFunctionArgs) {
  const id = params.id
  if (!id || !db[id]) {
    throw new Response("Not found", { status: 404 })
  }

  const formData = await request.formData()
  const submission = parse(formData, { schema })

  if (!submission.value) {
    return json({ status: "error", submission }, { status: 400 })
  }

  const { email, name } = submission.value

  if (email) {
    db[id].email = email.toString()
  }

  if (name) {
    db[id].name = name.toString()
  }

  return new Response(null, {
    status: 200,
  })
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id
  if (!id || !db[id]) {
    throw redirect("/content/remix-form-autosave/example")
  }

  return json({
    email: db[id].email,
    name: db[id].name,
  })
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const fetcher = useDebounceFetcher()

  return (
    <input
      className="block w-96 rounded border border-gray-300 px-4 py-3 focus:ring-1 focus:ring-indigo-600"
      {...props}
      onChange={(event) => {
        fetcher.submit(event.currentTarget.form, {
          replace: true,
          debounceTimeout: 500,
        })

        props.onChange?.(event)
      }}
      onBlur={(event) => {
        fetcher.submit(event.currentTarget.form, {
          replace: true,
        })

        props.onBlur?.(event)
      }}
    />
  )
}

export default function Example() {
  const { email, name } = useLoaderData<typeof loader>() || {}
  const fetcher = useDebounceFetcher()

  const actionData = useActionData<typeof action>()
  const [form, fields] = useForm({
    id: "example",
    constraint: getFieldsetConstraint(schema),
    onValidate({ formData }) {
      return parse(formData, { schema })
    },
    defaultValue: {
      email,
      name,
    },
    lastSubmission: actionData?.submission,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  })

  return (
    <div className="mx-auto grid min-h-screen place-items-center">
      <div className="text-center">
        <h1 className="mb-6 text-3xl text-gray-800">Profile information</h1>

        <p className="mb-8 max-w-prose text-lg text-gray-500">
          Add your personal details. This form will save automatically.
        </p>

        <fetcher.Form method="post" {...form.props}>
          <div className="bg-light  mx-auto mb-8 inline-flex w-full max-w-lg flex-col  gap-8 overflow-hidden rounded-lg border border-gray-100 text-left shadow-xl">
            <div className="flex flex-col gap-4 px-8 py-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-medium text-gray-600"
                >
                  Email address
                </label>

                <Input {...conform.input(fields.email)} />

                {fields.email.errors ? (
                  <div role="alert">{fields.email.errors[0]}</div>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block font-medium text-gray-600"
                >
                  Name
                </label>

                <Input {...conform.input(fields.name)} />

                {fields.name.errors ? (
                  <div role="alert">{fields.name.errors[0]}</div>
                ) : null}
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
