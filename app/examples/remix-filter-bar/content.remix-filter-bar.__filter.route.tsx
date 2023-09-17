// http://localhost:3000/content/remix-filter-bar/example

import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Outlet, useRouteLoaderData } from "@remix-run/react"
import db from "./db.server"
import { en } from "./i18n"
export { mergeHeaders as headers } from "~/utils/misc"

export async function loader({ request }: LoaderArgs) {
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
    "content.remix-filter-bar.__filter",
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
