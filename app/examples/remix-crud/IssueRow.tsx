import { useParams } from "@remix-run/react"
import { Link, useFetcher } from "@remix-run/react"
import { useState } from "react"
import { PencilIcon, TrashIcon } from "@heroicons/react/20/solid"

export function IssueRow(item: { id: number; title: string; date: string }) {
  const idString = String(item.id).padStart(3, "0")
  const fetcher = useFetcher()
  const params = useParams()
  const [isDeleting, setIsDeleting] = useState(false)

  return isDeleting ? null : (
    <li className="group relative hover:bg-gray-50">
      <Link
        prefetch="intent"
        to={`issues/${item.id}`}
        className="flex items-center gap-x-4 px-4 py-3 text-sm text-gray-600"
      >
        <span className="min-w-[4rem]">{idString}</span>{" "}
        <span className="grow font-medium text-gray-800">{item.title}</span>
        <span> {item.date}</span>
      </Link>

      <fetcher.Form
        onSubmit={(event) => {
          // There's only one action in this form, but this looks built to have multiple
          // Checking here makes it easy to see how to add the next one
          if (fetcher.submission?.action.endsWith("/delete")) {
            setIsDeleting(true)
          }
        }}
        className="bg-light absolute -right-2 -top-2 hidden rounded-sm border border-gray-100 shadow group-focus-within:flex group-hover:flex group-focus:flex"
      >
        <Link
          to={`/content/remix-crud/example/${params.id}/issues/${item.id}`}
          className="inline-block rounded p-1 text-gray-700 hover:bg-gray-100 hover:text-black"
        >
          <span className="sr-only">Edit issue</span>
          <PencilIcon className="h-5 w-5" />
        </Link>

        <button
          type="submit"
          formMethod="POST"
          formAction={`/content/remix-crud/example/${params.id}/issues/${item.id}/delete`}
          className="inline-block rounded p-1 text-gray-700 hover:bg-gray-100 hover:text-black"
        >
          <span className="sr-only">Delete issue</span>
          <TrashIcon className="h-5 w-5" />
        </button>
      </fetcher.Form>
    </li>
  )
}
