import type { HeadersFunction } from "@remix-run/node"

export function getRequiredEnvVar(key: string, env = process.env): string {
  if (key in env && typeof env[key] === "string") {
    return env[key] ?? ""
  }

  throw new Error(`Environment variable ${key} is not defined`)
}

export function getDomainUrl(request: Request) {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host")
  if (!host) {
    throw new Error("Could not determine domain URL.")
  }
  const protocol = host.includes("localhost") ? "http" : "https"
  return `${protocol}://${host}`
}

export function typedBoolean<T>(
  value: T,
): value is Exclude<T, "" | 0 | false | null | undefined> {
  return Boolean(value)
}

export function removeTrailingSlash(s: string) {
  return s.endsWith("/") ? s.slice(0, -1) : s
}

export function safeEncode(input?: string | null) {
  if (!input) return ""

  return encodeURIComponent(input)
}

export const mergeHeaders: HeadersFunction = ({
  loaderHeaders,
  parentHeaders,
}) => {
  const headers = new Headers()
  const usefulHeaders = ["Cache-Control", "Vary", "Server-Timing"]
  for (const headerName of usefulHeaders) {
    if (loaderHeaders.has(headerName)) {
      headers.set(headerName, loaderHeaders.get(headerName)!)
    }
  }
  const appendHeaders = ["Server-Timing"]
  for (const headerName of appendHeaders) {
    if (parentHeaders.has(headerName)) {
      headers.append(headerName, parentHeaders.get(headerName)!)
    }
  }
  const useIfNotExistsHeaders = ["Cache-Control", "Vary"]
  for (const headerName of useIfNotExistsHeaders) {
    if (!headers.has(headerName) && parentHeaders.has(headerName)) {
      headers.set(headerName, parentHeaders.get(headerName)!)
    }
  }

  return headers
}

export const headers: HeadersFunction = ({ loaderHeaders, parentHeaders }) => {
  return setDefaultHeaders(new Headers(), {
    loaderHeaders,
    parentHeaders,
  })
}

function setDefaultHeaders(
  headers: Headers,
  args: {
    loaderHeaders: Headers
    parentHeaders: Headers
  },
) {
  if (args.loaderHeaders.has("Server-Timing")) {
    headers.set("Server-Timing", args.loaderHeaders.get("Server-Timing")!)
  }

  if (args.parentHeaders.has("Server-Timing")) {
    headers.append("Server-Timing", args.parentHeaders.get("Server-Timing")!)
  }

  return headers
}
