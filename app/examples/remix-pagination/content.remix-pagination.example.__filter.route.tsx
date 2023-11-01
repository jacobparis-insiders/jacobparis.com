// http://localhost:3000/content/remix-pagination/example

import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Outlet, useRouteLoaderData } from "@remix-run/react"

import db from "./db.server.ts"
import { en } from "./i18n.tsx"

export { mergeHeaders as headers } from "~/utils/misc.ts"

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    filterTypes: {
      status: {
        label: "Status",
        type: "operator",
        operators: ["eq", "ne"],
        values: db.statuses.map((status) => ({
          value: status,
          label: en[status] || status,
        })),
      },
      assigneeId: {
        label: "Assignee",
        type: "operator",
        operators: ["eq", "ne"],
        values: db.users.map((user) => ({
          value: user.id,
          label: user.name,
        })),
      },
      creatorId: {
        label: "Creator",
        type: "operator",
        operators: ["eq", "ne"],
        values: db.users.map((user) => ({
          value: user.id,
          label: user.name,
        })),
      },
      priority: {
        label: "Priority",
        type: "operator",
        operators: ["eq", "ne"],
        values: db.priorities.map((priority) => ({
          value: priority,
          label: en[priority] || priority,
        })),
      },
      labels: {
        label: "Labels",
        type: "operator",
        operators: ["eq", "ne"],
        values: db.labels.map((label) => ({
          value: label,
          label: en[label] || label,
        })),
      },
      content: {
        label: "Content",
        type: "operator",
        operators: ["eq", "ne"],
      },
      isParent: {
        label: "Parent issues",
        type: "boolean",
      },
      isChild: {
        label: "Sub-issues",
        type: "boolean",
      },
      isBlocked: {
        label: "Blocked issues",
        type: "boolean",
      },
      isBlocking: {
        label: "Blocking issues",
        type: "boolean",
      },
      hasReferences: {
        label: "Issues with references",
        type: "boolean",
      },
      hasDuplicates: {
        label: "Duplicates",
        type: "boolean",
      },
      dueDate: {
        label: "Due date",
        operators: ["eq", "gt", "lt"],
        type: "operator",
      },
      createdDate: {
        label: "Created date",
        operators: ["eq", "gt", "lt"],
        type: "operator",
      },
      updatedDate: {
        label: "Updated date",
        operators: ["eq", "gt", "lt"],
        type: "operator",
      },
      startedDate: {
        label: "Started date",
        operators: ["eq", "gt", "lt"],
        type: "operator",
      },
      triagedDate: {
        label: "Triaged date",
        operators: ["eq", "gt", "lt"],
        type: "operator",
      },
    } as const,
  })
}

export function useFilterData() {
  const data = useRouteLoaderData<typeof loader>(
    "content.remix-pagination.example.__filter",
  )

  if (data === undefined) {
    throw new Error("Cannot use useFilterData outside of the __filter layout")
  }

  return data
}

export default function Example() {
  return (
    <div className="outlet">
      <Outlet />
    </div>
  )
}
