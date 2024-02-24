// http://localhost:3000/writer

import { useEffect, useRef } from "react"

import { redirect } from "@remix-run/node"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { Button } from "#app/components/ui/button.tsx"

import { Form, Outlet, useFetchers } from "@remix-run/react"
import { Field } from "#app/components/forms.tsx"

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const filename = url.searchParams.get("filename")

  if (filename) {
    return redirect(`/writer/${filename}`)
  }

  return null
}

export default function Writer() {
  const fetchers = useFetchers()

  const suggestionsMap = useRef(new Map<string, string>())
  useEffect(() => {
    const map = suggestionsMap.current

    fetchers
      .filter((fetcher) => fetcher.key.startsWith("writer@"))
      .filter((fetcher) => fetcher.state !== "submitting" && fetcher.data)
      .forEach((fetcher) => {
        map.set(fetcher.key, fetcher.data.prediction)
      })

    console.log(suggestionsMap)
  }, [fetchers, suggestionsMap])

  return (
    <div className="min-h-screen  rounded bg-neutral-100 p-2">
      <Form method="GET" className="flex items-end justify-center gap-x-2">
        <Field
          labelProps={{
            children: "File",
          }}
          inputProps={{
            name: "filename",
            defaultValue: "",
          }}
        />

        <Button type="submit" className="mb-8">
          Load
        </Button>
      </Form>

      <Outlet />
    </div>
  )
}
