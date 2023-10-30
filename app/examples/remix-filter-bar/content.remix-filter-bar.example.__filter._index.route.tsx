// http://localhost:3000/content/remix-filter-bar/example

import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import type { GroupedExpression } from "odata-qs"
import { getValuesFromMap, parse } from "odata-qs"
import { useState } from "react"
import { Icon } from "~/components/icon.tsx"
import { Button } from "~/components/ui/button.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover.tsx"
import { useFilterData } from "./content.remix-filter-bar.example.__filter.route.tsx"
import db from "./db.server.ts"
import { en } from "./i18n.tsx"
import { DataTable } from "./ui/DataTable.tsx"
import { FilterBar } from "./ui/FilterBar.tsx"
import { FilterMenu } from "./ui/FilterMenu.tsx"

export { mergeHeaders as headers } from "~/utils/misc.ts"

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.get("q")
  const tree = parse(query, [
    "status",
    "assigneeId",
    "creatorId",
    "priority",
    "labels",
    "content",
    "isChild",
    "isParent",
    "isBlocked",
    "isBlocking",
    "hasDuplicates",
    "hasReferences",
    "createdDate",
    "updatedDate",
    "dueDate",
    "startedDate",
    "triagedDate",
  ])

  const issues = db.issues
    .filter((issue) => {
      if (
        [
          tree.status?.eq && !tree.status.eq.values.includes(issue.status),
          tree.status?.ne && tree.status.ne.values.includes(issue.status),
          tree.assigneeId?.eq &&
            !tree.assigneeId.eq.values.includes(issue.assigneeId),
          tree.assigneeId?.ne &&
            tree.assigneeId.ne.values.includes(issue.assigneeId),
          tree.creatorId?.eq &&
            !tree.creatorId.eq.values.includes(issue.creatorId),
          tree.creatorId?.ne &&
            tree.creatorId.ne.values.includes(issue.creatorId),
          tree.priority?.eq &&
            !tree.priority.eq.values.includes(issue.priority),
          tree.priority?.ne && tree.priority.ne.values.includes(issue.priority),
          tree.labels?.eq && !tree.labels.eq.values.includes(issue.label),
          tree.labels?.ne && tree.labels.ne.values.includes(issue.label),
          // Booleans just have { eq: { values: [true]} } or { ne: { values: [true]} }
          tree.isChild?.eq && issue.parentIssueId === null,
          tree.isChild?.ne && issue.parentIssueId !== null,
          tree.isBlocked?.eq && issue.blockedByIssueIds.length === 0,
          tree.isBlocked?.ne && issue.blockedByIssueIds.length > 0,
          tree.hasReferences?.eq && issue.referencesIssueIds.length === 0,
          tree.hasReferences?.ne && issue.referencesIssueIds.length > 0,
        ].some(Boolean)
      ) {
        return false
      }

      if (tree.content?.eq) {
        const patterns = tree.content.eq.values.map((value) =>
          String(value).toLowerCase(),
        )
        const content = `${issue.title} ${issue.description}`.toLowerCase()

        if (!patterns.some((pattern) => content.includes(pattern))) {
          return false
        }
      }

      if (tree.isParent) {
        const hasChild = db.issues.some(
          (other) => other.parentIssueId === issue.id,
        )

        if (tree.isParent.eq && hasChild) return false
        if (tree.isParent.ne && !hasChild) return false
      }

      if (tree.isBlocking) {
        const isBlocked = db.issues.some((other) =>
          other.blockedByIssueIds.includes(issue.id),
        )

        if (tree.isBlocking.eq && !isBlocked) return false
        if (tree.isBlocking.ne && isBlocked) return false
      }

      if (tree.hasDuplicates) {
        const hasDuplicates = db.issues.some(
          (other) => other.duplicateOfIssueId === issue.id,
        )

        if (tree.hasDuplicates.eq && !hasDuplicates) return false
        if (tree.hasDuplicates.ne && hasDuplicates) return false
      }

      if (tree.hasReferences) {
        const hasReferences = db.issues.some((other) =>
          other.referencesIssueIds.includes(issue.id),
        )

        if (tree.hasReferences.eq && !hasReferences) return false
        if (tree.hasReferences.ne && hasReferences) return false
      }

      if (
        tree.createdDate &&
        !matchesDate(tree.createdDate, issue.createdDate)
      ) {
        return false
      }

      if (
        tree.updatedDate &&
        !matchesDate(tree.updatedDate, issue.updatedDate)
      ) {
        return false
      }

      if (tree.dueDate && !matchesDate(tree.dueDate, issue.dueDate)) {
        return false
      }

      if (
        tree.startedDate &&
        !matchesDate(tree.startedDate, issue.startedDate)
      ) {
        return false
      }

      if (
        tree.triagedDate &&
        !matchesDate(tree.triagedDate, issue.triagedDate)
      ) {
        return false
      }

      return true
    })
    .slice(0, 30)
    .map((issue) => ({
      ...issue,
      assignee: db.users.find((user) => user.id === issue.assigneeId),
      creator: db.users.find((user) => user.id === issue.creatorId),
    }))

  return json({
    filters: getValuesFromMap(tree).map((group, index) => ({
      ...group,
      id: index,
      values: group.values.map((value) => String(value)),
    })),
    issues,
  })
}

function matchesDate(
  branch: Partial<
    Record<
      "eq" | "gt" | "ge" | "lt" | "le" | "ne",
      GroupedExpression | undefined
    >
  >,
  matchDate: Date | string | null,
) {
  if (!matchDate) return false

  const date = matchDate instanceof Date ? matchDate : new Date(matchDate)

  const { eq, ne, gt, ge, lt, le } = branch

  if (
    eq &&
    date.toISOString().slice(0, 10) !==
      safeNewDate(eq.values[0]).toISOString().slice(0, 10)
  ) {
    return false
  }
  if (
    ne &&
    date.toISOString().slice(0, 10) ===
      safeNewDate(ne.values[0]).toISOString().slice(0, 10)
  ) {
    return false
  }

  if (gt && date <= safeNewDate(gt.values[0])) return false
  if (ge && date < safeNewDate(ge.values[0])) return false
  if (lt && date >= safeNewDate(lt.values[0])) return false
  if (le && date > safeNewDate(le.values[0])) return false

  return true
}

function safeNewDate(input: string | number | boolean | Date) {
  if (typeof input === "boolean") return new Date()

  return new Date(input)
}

export function FilterExample() {
  return (
    <div className="not-prose">
      <Link
        to="/content/remix-filter-bar/example"
        className="flex flex-wrap gap-2"
      >
        <div className="dark:bg-neutral-950 flex items-center rounded border border-neutral-200 bg-white text-sm  text-neutral-600 dark:border-neutral-800 ">
          <div className="px-2 py-1">Status</div>
          <div className="px-2 py-1 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50">
            is
          </div>
          <div className="px-2 py-1 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50">
            todo
          </div>
          <button className="h-full rounded-r px-2 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50">
            <Icon name="cross-2" className="h-4 w-4" />
          </button>
        </div>

        <div className="dark:bg-neutral-950 flex items-center rounded border border-neutral-200 bg-white text-sm  text-neutral-600 dark:border-neutral-800 ">
          <div className="px-2 py-1">Priority</div>
          <div className="px-2 py-1 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50">
            is not
          </div>
          <div className="px-2 py-1 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50">
            done
          </div>
          <button className="h-full rounded-r px-2 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50">
            <Icon name="cross-2" className="h-4 w-4" />
          </button>
        </div>
      </Link>
    </div>
  )
}

export default function Example() {
  const { filters, issues } = useLoaderData<typeof loader>()
  const [open, setOpen] = useState(false)
  const { filterTypes } = useFilterData()

  return (
    <div className="mx-auto max-w-6xl py-4">
      <div className="flex items-center gap-x-4">
        <h1 className="bold text-2xl">Remix Filter Bar</h1>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild aria-expanded={open} role="combobox">
            <Button variant="outline">
              <Icon
                name="plus"
                className="-ml-2 mr-1 h-4 w-4 shrink-0 opacity-50"
              />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <FilterMenu key={open ? "open" : "closed"} />
          </PopoverContent>
        </Popover>
      </div>

      <p className="mt-4">Create filters to refine the data in the table</p>

      <div className="flex flex-wrap gap-x-4 gap-y-2 py-3">
        <FilterBar filters={filters} types={filterTypes} />
      </div>

      <div className="mt-4">
        <h2 className="bold text-xl">Issues</h2>

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
            {
              accessorKey: "assignee",
              header: "Assignee",
              accessorFn(issue) {
                return issue.assignee?.name
              },
              // Render avatar initial placeholder
              cell: ({ row }) => (
                <div
                  className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-violet-500 font-medium text-white"
                  title={row.getValue("assignee")}
                >
                  {row.getValue<string>("assignee")[0]!}
                </div>
              ),
            },
            {
              accessorKey: "creator",
              header: "Creator",
              accessorFn(issue) {
                return issue.creator?.name
              },
              cell: ({ row }) => (
                <div
                  className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-black font-medium text-white"
                  title={row.getValue("creator")}
                >
                  {row.getValue<string>("creator")[0]}
                </div>
              ),
            },
            {
              accessorKey: "priority",
              header: "Priority",
              cell: ({ row }) => (
                <div className="text-neutral-600 ">
                  {en[row.getValue<string>("priority")]}
                </div>
              ),
            },
            {
              accessorKey: "label",
              header: "Label",
              cell: ({ row }) => (
                <div className="whitespace-nowrap text-neutral-600">
                  {en[row.getValue<string>("label")]}
                </div>
              ),
            },
            {
              accessorKey: "date",
              header: "Created date",
              accessorFn(issue) {
                return issue.createdDate
              },
              cell: ({ row }) => (
                <span
                  title={`Created ${row.getValue("date")}`}
                  className="whitespace-nowrap"
                >
                  {new Date(row.getValue("date")).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              ),
            },
          ]}
          data={issues}
        />
      </div>
    </div>
  )
}
