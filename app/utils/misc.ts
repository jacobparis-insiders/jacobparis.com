import type { HeadersFunction } from "@remix-run/node"

import { type ClassValue, clsx } from "clsx"
import { useEffect, useMemo, useRef } from "react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function requireRequestWithToken(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")

  invariantResponse(
    token === process.env.INTERNAL_COMMAND_TOKEN,
    "Unauthorized",
    {
      status: 401,
    },
  )
}

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

/**
 * Provide a condition and if that condition is falsey, this throws a 400
 * Response with the given message.
 *
 * inspired by invariant from 'tiny-invariant'
 *
 * @example
 * invariantResponse(typeof value === 'string', `value must be a string`)
 *
 * @param condition The condition to check
 * @param message The message to throw (or a callback to generate the message)
 * @param responseInit Additional response init options if a response is thrown
 *
 * @throws {Response} if condition is falsey
 */
export function invariantResponse(
  condition: any,
  message: string | (() => string),
  responseInit?: ResponseInit,
): asserts condition {
  if (!condition) {
    throw new Response(typeof message === "function" ? message() : message, {
      status: 400,
      ...responseInit,
    })
  }
}

/**
 * Simple debounce implementation
 */
function debounce<Callback extends (...args: Parameters<Callback>) => void>(
  fn: Callback,
  delay: number,
) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<Callback>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * Debounce a callback function
 */
export function useDebounce<
  Callback extends (...args: Parameters<Callback>) => ReturnType<Callback>,
>(callback: Callback, delay: number) {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })
  return useMemo(
    () =>
      debounce(
        (...args: Parameters<Callback>) => callbackRef.current(...args),
        delay,
      ),
    [delay],
  )
}
