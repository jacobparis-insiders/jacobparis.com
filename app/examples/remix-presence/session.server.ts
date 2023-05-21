import { createCookieSessionStorage } from "@remix-run/node" // or cloudflare/deno

type SessionData = {
  userId: string
  name: string
  emoji: string
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData>({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "__remix-presence-session",
      // all of these are optional
      httpOnly: true,
      maxAge: 3600,
      path: "/content/remix-presence/example",
      sameSite: "lax",
      secrets: ["s3cret1"],
      secure: true,
    },
  })

export { getSession, commitSession, destroySession }
