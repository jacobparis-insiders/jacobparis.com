// http://localhost:3000/content/remix-crud/example

import { Link, Outlet, useParams } from "@remix-run/react"
import { XMarkIcon } from "@heroicons/react/24/outline"

export default function Modal() {
  const params = useParams()

  return (
    <div className="mx-auto grid min-h-screen place-items-center">
      <div className="bg-light mx-auto mb-8 w-full max-w-xl overflow-hidden border border-gray-100 text-left sm:rounded-lg sm:shadow-xl">
        <div className="flex border-b border-gray-100 p-1">
          <Link
            prefetch="intent"
            to={`/content/remix-crud/example/${params.id}`}
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
