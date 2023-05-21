// http://localhost:3000/examples/remix-form-toast

import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { commitSession, getSession } from "./session.server"
import { db } from "./db.server"
import invariant from "tiny-invariant"
import { Transition } from "@headlessui/react"
import { useEffect, useState } from "react"

export async function action({ params, request }: ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"))

  const formData = await request.formData()
  const title = formData.get("title")
  invariant(title, "Title is required")

  const description = formData.get("description")

  const id = db.items.length + 1

  db.items.push({
    createdAt: new Date(),
    id: db.items.length + 1,
    title: title.toString(),
    description: description?.toString(),
  })

  session.flash("message", `Task ${String(id).padStart(3, "0")} created!`)

  return new Response(null, {
    status: 201,
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  })
}

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"))
  const message = session.get("message") || null

  return json(
    {
      message,
      items: db.items.map((item) => {
        return {
          ...item,
          idString: String(item.id).padStart(3, "0"),
          date: item.createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        }
      }),
    },
    {
      headers: {
        // only necessary with cookieSessionStorage
        "Set-Cookie": await commitSession(session),
      },
    },
  )
}

export default function Example() {
  const { message, items } = useLoaderData<typeof loader>() || {}

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
        <h1 className="mb-6 text-3xl text-gray-800">
          What do you need to do today?
        </h1>

        <p className="mb-8 max-w-prose text-lg text-gray-500">
          Add important tasks to your list and cross them off, one-by-one!
        </p>

        <div className="mx-auto mb-8 max-w-lg border border-gray-100 text-left ">
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li
                key={item.createdAt}
                className="flex items-center gap-x-4 px-4 py-3 text-sm hover:bg-gray-50"
              >
                <span className="min-w-[4rem] text-gray-600">
                  {item.idString}
                </span>{" "}
                <span className="grow font-medium text-gray-800">
                  {item.title}
                </span>
                <span className="text-gray-600"> {item.date}</span>
              </li>
            ))}
          </ul>

          {items.length === 0 ? (
            <p className="py-4 text-center text-gray-500">No tasks yet</p>
          ) : null}
        </div>

        <Form method="post">
          <div className="bg-light  mx-auto mb-8 inline-flex w-full max-w-lg flex-col  gap-8 overflow-hidden rounded-lg border border-gray-100 text-left shadow-xl">
            <div className="" key={message}>
              <input
                aria-label="Title"
                id="title"
                name="title"
                type="text"
                placeholder="Task title"
                className="block w-full border-none bg-transparent px-4 py-3 text-lg placeholder:text-gray-400 focus:shadow-none focus:outline-none focus:ring-0"
                required
              />

              <input
                aria-label="Description"
                id="description"
                name="description"
                type="text"
                placeholder="Add a description…"
                className="block w-full border-none bg-transparent px-4 py-2 placeholder:text-gray-400 focus:shadow-none focus:outline-none focus:ring-0"
              />
            </div>

            <div className="flex justify-end border-t border-gray-100  px-4 py-3">
              <button
                type="submit"
                className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              >
                Create task
              </button>
            </div>
          </div>
        </Form>
        {message ? <Toast key={message} message={message} /> : null}
      </div>
    </div>
  )
}

// toast message component that deletes itself after 2 seconds
function Toast({ message, time = 5000 }: { message: string; time?: number }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setShow(false), 2000)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <Transition
      show={show}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed bottom-4 right-4  rounded-lg border border-gray-100 bg-white px-4 py-2 text-left text-sm font-medium shadow-lg">
        {message}
      </div>
    </Transition>
  )
}
