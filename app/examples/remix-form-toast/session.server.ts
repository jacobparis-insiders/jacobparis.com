import { createCookieSessionStorage } from "@remix-run/node" // or cloudflare/deno

type SessionData = {
  userId: string
}

type SessionFlashData = {
  message: string
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "__remix-form-toast-session",
      // all of these are optional
      httpOnly: true,
      maxAge: 60,
      path: "content/remix-form-toast/example",
      sameSite: "lax",
      secrets: ["s3cret1"],
      secure: true,
    },
  })

export { commitSession, destroySession, getSession }
