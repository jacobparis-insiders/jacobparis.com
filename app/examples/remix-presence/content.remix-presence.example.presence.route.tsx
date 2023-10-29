// http://localhost:3000/content/remix-presence/example

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { useEffect } from "react"
import { useEventSource } from "remix-utils/sse/react"
import { eventStream } from "remix-utils/sse/server"
import invariant from "tiny-invariant"
import type { ValidRoute } from "./db.server.ts"
import db from "./db.server.ts"
import { getSession } from "./session.server.ts"

const validRoutes: ValidRoute[] = ["/content/remix-presence/example"]

export async function action({ params, request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"))
  const form = await request.formData()
  const route = form.get("route")
  invariant(route, "Route is required")
  invariant(
    validRoutes.includes(route.toString() as ValidRoute),
    "Route is invalid",
  )

  const userId = session.get("userId")

  if (!userId) {
    return new Response(null, {
      status: 401,
    })
  }

  const name = session.get("name")
  const emoji = session.get("emoji")
  if ((emoji && !validateEmoji(emoji)) || (name && !validateName(name))) {
    return new Response(null, {
      status: 400,
    })
  }

  db.presences[userId] = {
    id: userId,
    name: session.get("name") || "Anonymous",
    emoji,
    lastSeenWhere: "/content/remix-presence/example",
    lastSeenWhen: new Date(),
  }

  // remove presences that are older than 1 minute
  const now = new Date()
  for (const [userId, presence] of Object.entries(db.presences)) {
    if (now.getTime() - presence.lastSeenWhen.getTime() > 60 * 1000) {
      delete db.presences[userId]
    }
  }

  return new Response(null, {
    status: 200,
  })
}

function validateName(name: string) {
  if (!name) return false
  if (name.length > 50) return false

  if (name.includes("<") || name.includes(">")) return false
  if (name.includes("{") || name.includes("}")) return false
  if (name.includes('"') || name.includes("'")) return false

  return true
}

function validateEmoji(emoji: string) {
  if (emoji.length !== 2) return false
  if (
    ![
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
    ].includes(emoji)
  )
    return false

  return true
}
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const route = url.searchParams.get("route")
  if (route && !validRoutes.includes(route as ValidRoute)) {
    return new Response(null, {
      status: 400,
    })
  }

  const fetchInterval = url.searchParams.get("fetchInterval") || "1000"
  if (isNaN(Number(fetchInterval))) {
    return new Response(null, {
      status: 400,
    })
  }

  return eventStream(request.signal, function setup(send) {
    const interval = setInterval(() => {
      const users = Object.values(db.presences).filter((user) => {
        if (route) {
          return user.lastSeenWhere === route
        }

        return true
      })
      send({
        event: "users",
        data: JSON.stringify(users),
      })
    }, Number(fetchInterval))

    return function clear() {
      clearInterval(interval)
    }
  })
}

export function Avatar({ name, emoji }: { name: string; emoji?: string }) {
  return emoji ? (
    <span
      title={name}
      className="flex h-12 w-12 items-center justify-center rounded-full border-4  text-5xl "
    >
      {emoji}
    </span>
  ) : (
    <div
      title={name}
      className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-red-700 text-3xl font-medium text-white"
    >
      {name[0]}
    </div>
  )
}

function useInterval(callback: () => void, delay: number) {
  useEffect(() => {
    const id = setInterval(callback, delay)
    return () => clearInterval(id)
  }, [callback, delay])
}

type PresenceUser = {
  id: string
  name: string
  emoji?: string
}

export function usePresenceUsers(
  route: string,
  {
    self,
    initialUsers,
    postInterval = 3000,
    fetchInterval = 1000,
  }: {
    self: PresenceUser
    initialUsers: PresenceUser[]
    postInterval?: number
    fetchInterval?: number
  },
) {
  useInterval(() => {
    const body = new FormData()
    body.append("route", route)

    fetch("/content/remix-presence/example/presence", {
      method: "POST",
      credentials: "include",
      body,
    })
  }, postInterval)

  const streamUrl = new URL(
    `/content/remix-presence/example/presence`,
    "http://localhost:3000",
  )
  streamUrl.searchParams.set("route", encodeURIComponent(route))
  streamUrl.searchParams.set("fetchInterval", fetchInterval.toString())
  const userStream = useEventSource(streamUrl.pathname, {
    event: "users",
  })
  const users = userStream
    ? (JSON.parse(userStream) as typeof initialUsers)
    : initialUsers

  // inject our up-to-date self to the top of the list
  const usersWithoutSelf = users.filter((user) => user.id !== self.id)
  return [self, ...usersWithoutSelf]
}
