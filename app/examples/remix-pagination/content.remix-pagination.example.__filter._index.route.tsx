// http://localhost:3000/content/remix-pagination/example

import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Icon } from "~/components/icon"
import { Link, useLoaderData } from "@remix-run/react"
import db from "./db.server"
import { DataTable } from "./ui/DataTable"
import { en } from "./i18n"
import { PaginationBar } from "./PaginationBar"

export { mergeHeaders as headers } from "~/utils/misc"

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const $top = Number(url.searchParams.get("$top")) || 10
  const $skip = Number(url.searchParams.get("$skip")) || 0

  const issues = db.issues.slice($skip, $skip + $top).map((issue) => ({
    ...issue,
    assignee: db.users.find((user) => user.id === issue.assigneeId),
    creator: db.users.find((user) => user.id === issue.creatorId),
  }))

  return json({
    total: db.issues.length,
    issues,
  })
}

export function PaginationExample() {
  return (
    <div className="not-prose my-2">
      <PaginationBar total={100} />
    </div>
  )
}

export default function Example() {
  const { total, issues } = useLoaderData<typeof loader>()

  return (
    <div className="mx-auto max-w-6xl py-4">
      <div className="flex items-center gap-x-4 px-2">
        <h1 className="bold text-2xl">Remix Pagination</h1>
      </div>

      <div className="mt-4 px-2">
        <p className="mt-4">
          Navigate through the dataset by changing the page
        </p>

        <div className="my-4">
          <PaginationBar total={total} />
        </div>

        <div className="">
          <DataTable
            columns={[
              {
                accessorKey: "id",
                header: "Id",
                cell: ({ row }) => {
                  const idString = String(row.original.id).padStart(3, "0")

                  return <div className=" text-neutral-600">{idString}</div>
                },
              },
              {
                header: "Title",
                accessorKey: "title",
                cell: ({ row }) => (
                  <div className="font-medium text-neutral-800">
                    {row.getValue("title")}
                  </div>
                ),
              },

              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => (
                  <div className="whitespace-nowrap text-neutral-600">
                    {en[row.getValue<string>("status")]}
                  </div>
                ),
              },
            ]}
            data={issues}
          />
        </div>
      </div>
    </div>
  )
}
