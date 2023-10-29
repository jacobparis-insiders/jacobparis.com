import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useLocation,
  useRouteError,
} from "@remix-run/react"
import isbot from "isbot"
import tailwindStylesheetUrl from "~/styles/tailwind.css"
import { ButtonLink } from "./components/ButtonLink.tsx"
import { SocialBannerSmall } from "./components/SocialBannerSmall.tsx"
import { keepAwake } from "./server/sleep.server.ts"
import { getServerTiming } from "./utils/timing.server.ts"

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    {
      rel: "icon",
      href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🥑</text></svg>",
    },
  ]
}

export const meta: MetaFunction = () => {
  return [
    { title: "Jacob Paris" },
    {
      name: "description",
      content:
        "Come check out my guides to make you better at building web applications.",
    },
    {
      name: "keywords",
      content:
        "Learn React, Learn Tailwind, Learn Javascript, Learn Typescript",
    },
    { name: "robots", content: "index,follow" },
    { name: "googlebot", content: "index,follow" },
    { property: "og:title", content: "Jacob Paris" },
    {
      property: "og:image",
      content: "https://www.jacobparis.com/images/og.png",
    },
    { name: "twitter:card", content: "summary_large_image" },
  ]
}

export const shouldRevalidate = () => false

export const loader: LoaderFunction = async ({ request }) => {
  const { time, getServerTimingHeader } = getServerTiming()

  const isBot = await time("isBot", async () => {
    const isBot = await isbot(request.headers.get("user-agent"))
    if (!isBot) {
      void keepAwake()
    }

    return isBot
  })

  return json(
    {
      isBot: isBot,
    },
    {
      headers: getServerTimingHeader(),
    },
  )
}

export default function App() {
  const { isBot } = useLoaderData()
  const location = useLocation()
  const url = new URL(location.pathname, "https://www.jacobparis.com")

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <link rel="canonical" href={url.href} />
        <Links />
        <style>
          {`.bg-light {
          backdrop-filter: blur(1.5rem) saturate(200%) contrast(50%) brightness(130%);
          background-color: rgba(255, 255, 255, 0.5);
        }`}
        </style>
      </head>
      <body className="h-full bg-white">
        <Outlet />
        <ScrollRestoration />
        <LiveReload />
        {isBot ? null : <Scripts />}
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en" className="h-full">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body className="h-full bg-white">
          <SocialBannerSmall className="bg-light sticky top-0 z-30 mb-8 border-b border-gray-100 py-1" />
          <div className="flex">
            <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-48">
              <h1 className="mt-2 text-4xl font-medium tracking-tight text-black sm:text-5xl">
                404
              </h1>
              <p className="mt-4 text-lg font-medium text-black text-opacity-50">
                That page can't be found
              </p>

              <div className="mt-6">
                <ButtonLink
                  className="inline-flex flex-grow-0 items-center px-4 py-2"
                  href="/"
                >
                  <span className="mx-2 font-medium leading-6">
                    Take me home
                  </span>
                </ButtonLink>
              </div>
            </div>
          </div>
        </body>
      </html>
    )
  }

  // Don't forget to typecheck with your own logic.
  // Any value can be thrown, not just errors!
  let errorMessage = "Unknown error"
  if (isDefinitelyAnError(error)) {
    errorMessage = error.message
  }

  return (
    <div>
      <h1>Uh oh ...</h1>
      <p>Something went wrong.</p>
      <pre>{errorMessage}</pre>
    </div>
  )
}

function isDefinitelyAnError(error: unknown): error is Error {
  return typeof error === "object" && error !== null && "message" in error
}
