// http://localhost:3000/examples/remix-crud

import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Await,
  Form,
  Link,
  Outlet,
  useActionData,
  useFetcher,
  useLoaderData,
  useParams,
  useSearchParams,
} from "@remix-run/react"
import { XMarkIcon } from "@heroicons/react/24/outline"

export default function Example() {
  const params = useParams()

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
      <div className="bg-light mx-auto mb-8 w-full max-w-xl overflow-hidden border border-gray-100 text-left sm:rounded-lg sm:shadow-xl">
        <div className="flex border-b border-gray-100 p-1">
          <Link
            prefetch="intent"
            to={`/examples/remix-crud/${params.id}`}
            className="inline-block rounded p-1 text-gray-700 hover:bg-gray-100 hover:text-black"
          >
            <span className="sr-only">Back to issues</span>
            <XMarkIcon className="h-5 w-5" />
          </Link>
        </div>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
