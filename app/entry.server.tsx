import type { EntryContext } from "@remix-run/node"
import { RemixServer } from "@remix-run/react"
import isbot from "isbot"
import minimatch from "minimatch"
import { renderToPipeableStream } from "react-dom/server"
import { PassThrough } from "stream"
import redirects from "./redirects.server.ts"
import "./refresh.ignored"
import { getSitemapXml } from "./sitemap.server.ts"
import { server } from "#/mocks/index.ts"
const ABORT_DELAY = 10 * 60 * 1000

if (process.env.NODE_ENV === "development") {
  server.listen({ onUnhandledRequest: "warn" })
  console.info("MSW initialised")
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const url = new URL(request.url)

  // if there's a trailing slash in the URL, redirect to the one without it
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    // remove the trailing slash from the pathname and reassemble the href include search params
    url.pathname = url.pathname.slice(0, -1)

    return Response.redirect(url.toString(), 301)
  }

  for (const redirect of redirects) {
    try {
      void new URL(redirect.from)
      if (redirect.from === url.href) {
        return Response.redirect(
          redirect.to + url.pathname,
          redirect.status || 301,
        )
      }
      continue
    } catch (error) {}

    // use minimatch to check if the redirect.from glob matches the url.pathname
    const match = minimatch(url.pathname, redirect.from)
    // redirect if the glob matches but make sure the wildcard is carried over if the redirect.to has one
    if (match) {
      if (redirect.to.endsWith("*")) {
        return Response.redirect(
          url.origin +
            redirect.to.slice(0, -1) +
            url.pathname.slice(redirect.from.length - 1),
          redirect.status || 301,
        )
      }
    }

    if (redirect.from === url.pathname) {
      return Response.redirect(url.origin + redirect.to, redirect.status || 301)
    }
  }
  // redirect to www
  if (url.hostname === "search.jacobparis.com") {
    return Response.redirect(
      "https://twitterproductivity.com/search-cheatsheet" + url.pathname,
      301,
    )
  }

  if (url.hostname === "jacobparis.com") {
    return Response.redirect("https://www.jacobparis.com" + url.pathname, 301)
  }

  if (url.pathname === "/sitemap.xml") {
    const sitemap = await getSitemapXml(request, remixContext)

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Length": String(Buffer.byteLength(sitemap)),
      },
    })
  }

  // if (!request.headers.get("cookie")?.includes("clockOffset")) {
  //   const script = `
  //     document.cookie = 'clockOffset=' + (new Date().getTimezoneOffset() * -1) + '; path=/';
  //     window.location.reload();
  //   `

  //   return new Response(
  //     `<html><body><script>${script}</script></body></html>`,
  //     {
  //       headers: {
  //         "Content-Type": "text/html",
  //         "Set-Cookie": "clockOffset=0; path=/",
  //         Refresh: `0; url=${request.url}`,
  //       },
  //     },
  //   )
  // }

  const callbackName = isbot(request.headers.get("user-agent"))
    ? "onAllReady"
    : "onShellReady"

  return new Promise((resolve, reject) => {
    let didError = false

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        [callbackName]: () => {
          const body = new PassThrough()

          responseHeaders.set("Content-Type", "text/html")

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            }),
          )

          pipe(body)
        },
        onShellError: (err: unknown) => {
          reject(err)
        },
        onError: (error: unknown) => {
          didError = true

          console.error(error)
        },
      },
    )

    setTimeout(abort, ABORT_DELAY)
  })
}
