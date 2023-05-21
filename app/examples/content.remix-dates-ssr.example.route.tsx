// http://localhost:3000/content/remix-dates-ssr/example

import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import type { ReactNode } from "react"
import { Suspense } from "react"
import { useEffect, useState } from "react"
let hydrating = true
export { mergeHeaders as headers } from "~/utils/misc"

export async function loader({ request }: LoaderArgs) {
  const clockOffset = request.headers.get("Cookie")?.match(/clockOffset=(\d+)/)

  return json({
    date: {
      offsetValue: clockOffset
        ? offsetDate(new Date(), parseInt(clockOffset[1], 10))
        : new Date().toISOString(),
      serverValue: new Date().toISOString(),
    },
  })

  function offsetDate(date: Date, offset: number = 0) {
    date.setMinutes(date.getMinutes() + offset)
    return date.toISOString()
  }
}

export default function Example() {
  const { date } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>
        Client date is{" "}
        <time dateTime={date.serverValue}>
          <Suspense>
            <ClientOnly fallback={formatDate(date.offsetValue)}>
              {() => formatDate(date.serverValue)}
            </ClientOnly>
          </Suspense>
        </time>
      </h1>
    </div>
  )
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  })
}

type Props = {
  /**
   * You are encouraged to add a fallback that is the same dimensions
   * as the client rendered children. This will avoid content layout
   * shift which is disgusting
   */
  children(): ReactNode
  fallback?: ReactNode
}

function ClientOnly({ children, fallback = null }: Props) {
  return useHydrated() ? <>{children()}</> : <>{fallback}</>
}

function useHydrated() {
  let [hydrated, setHydrated] = useState(() => !hydrating)

  useEffect(function hydrate() {
    hydrating = false
    setHydrated(true)
  }, [])

  return hydrated
}
