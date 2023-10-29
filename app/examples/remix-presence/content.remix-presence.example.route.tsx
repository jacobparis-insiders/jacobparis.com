// http://localhost:3000/content/remix-presence/example

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { randomUuid } from "../crypto.ts"
import {
  Avatar,
  usePresenceUsers,
} from "./content.remix-presence.example.presence.route.tsx"
import db from "./db.server.ts"
import { commitSession, getSession } from "./session.server.ts"

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"))
  const form = await request.formData()
  const name = form.get("name")
  if (name) {
    session.set("name", name.toString())
  }

  const emoji = form.get("emoji")
  if (emoji) {
    session.set("emoji", emoji.toString())
  } else {
    session.unset("emoji")
  }

  return json(
    {},
    {
      headers: {
        // only necessary with cookieSessionStorage
        "Set-Cookie": await commitSession(session),
      },
    },
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"))
  let id = session.get("userId")
  if (!id) {
    id = randomUuid()
    session.set("userId", id)
    session.set("name", "Anonymous")
  }

  return json(
    {
      self: {
        id,
        name: session.get("name") || "Anonymous",
        emoji: session.get("emoji"),
      },
      initialUsers: Object.values(db.presences).filter(
        (user) => user.lastSeenWhere === "/content/remix-presence/example",
      ),
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
  const { self, initialUsers } = useLoaderData<typeof loader>()

  const presenceUsers = usePresenceUsers("/content/remix-presence/example", {
    self,
    initialUsers,
  })

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
        <h1 className="mb-6 text-3xl text-gray-800">Who is on this page?</h1>

        <p className="mb-8 max-w-prose text-lg text-gray-500">
          Choose a name and open this page in another browser (or incognito tab)
          to see how it works.
        </p>

        <Form method="post">
          <div className="bg-light  mx-auto mb-8 inline-flex w-full max-w-lg flex-col  gap-8 overflow-hidden rounded-lg border border-gray-100 text-left shadow-xl">
            <div className="">
              <input
                aria-label="Name"
                id="name"
                name="name"
                type="text"
                placeholder="Display name"
                defaultValue={self.name}
                className="block w-full border-none bg-transparent px-4 py-3 text-lg placeholder:text-gray-400 focus:shadow-none focus:outline-none focus:ring-0"
                required
              />

              {/* Radio buttons as row of emojis with the emoji as the value of the item */}
              <div className="flex flex-wrap">
                <label className="flex items-center justify-center">
                  <input
                    type="radio"
                    name="emoji"
                    value=""
                    defaultChecked={!self.emoji}
                    className="peer h-0 w-0 opacity-0"
                  />
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-transparent bg-white  p-2 text-3xl font-medium text-black focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 peer-checked:border-indigo-600">
                    A
                  </span>
                </label>
                {[
                  "😀",
                  "😆",
                  "😍",
                  "😎",
                  "🥸",
                  "🤩",
                  "🥳",
                  "🥰",
                  "😭",
                  "😡",
                  "🥶",
                  "😈",
                  "🤡",
                ].map((i) => (
                  <Emoji key={i} emoji={i} defaultChecked={self.emoji === i} />
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100  px-4 py-3">
              <button
                type="submit"
                className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              >
                Set name/emoji
              </button>
            </div>
          </div>
        </Form>
        <div>
          <div className="inline-flex -space-x-4 rounded-[2rem] bg-white">
            {presenceUsers.map((user) => (
              <Avatar key={user.id} name={user.name} emoji={user.emoji} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500">
            {presenceUsers.length === 0
              ? "No one is here"
              : `${String(presenceUsers.length)} ${
                  presenceUsers.length === 1 ? "person" : "people"
                } on this page`}
          </p>
        </div>
      </div>
    </div>
  )
}

function Emoji({
  emoji,
  defaultChecked,
}: {
  emoji: string
  defaultChecked: boolean
}) {
  return (
    <label className="flex items-center justify-center">
      <input
        type="radio"
        name="emoji"
        value={emoji}
        defaultChecked={defaultChecked}
        className="peer h-0 w-0 opacity-0"
      />
      <span className="rounded-full border-4  border-transparent text-5xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 peer-checked:border-indigo-600 ">
        {emoji}
      </span>
    </label>
  )
}
