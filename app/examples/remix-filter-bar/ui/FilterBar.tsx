// http://localhost:3000/content/remix-filter-bar/example

/**
 * This is the bar that shows the current filters applied to the list.
 * It's also interactive and allows you to add new ones
 */
import { Icon } from "~/components/icon"
import type { FilterExpression } from "../useFilterSearch"
import { useFilterSearch } from "../useFilterSearch"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { useState } from "react"
import { FilterMenu } from "./FilterMenu"
import { Command, CommandGroup, CommandItem } from "~/components/ui/command"
import { useFilterData } from "../content.remix-filter-bar.example.__filter.route"
import type { ComparisonOperator } from "odata-qs"
import { en } from "../i18n"

export function FilterBar({
  filters,
  types,
}: {
  filters: FilterExpression[]
  types: Record<
    string,
    {
      label: string
      type: "operator" | "boolean"
      operators: ComparisonOperator[]
      values: { value: string; label: string }[]
    }
  >
}) {
  return (
    <>
      {filters.map((filter) => {
        if (!(filter.subject in types)) {
          throw new Error(`Invalid filter subject: ${filter.subject}`)
        }

        const { type } = types[filter.subject]

        return (
          <div
            key={filter.subject}
            className="flex items-center rounded border border-neutral-200 bg-white text-sm text-neutral-600  dark:border-neutral-800 dark:bg-neutral-950 "
          >
            {type === "operator" ? (
              <OperatorFilter filter={filter} />
            ) : type === "boolean" ? (
              <BooleanFilter filter={filter} />
            ) : null}
          </div>
        )
      })}
    </>
  )
}

function OperatorFilter({ filter }: { filter: FilterExpression }) {
  const { setFilters } = useFilterSearch()
  const { filterTypes } = useFilterData()

  if (!(filter.subject in filterTypes)) {
    throw new Error(`Invalid filter subject: ${filter.subject}`)
  }

  const filterType = filterTypes[filter.subject as keyof typeof filterTypes]

  if (filterType.type !== "operator") throw new Error("Invalid filter type")

  const setOperator = ({
    subject,
    operator,
  }: {
    subject: string
    operator: ComparisonOperator
  }) => {
    setFilters((filters) =>
      filters.map((p) => ({
        subject: p.subject,
        operator: p.subject === subject ? operator : p.operator,
        values: p.values,
      })),
    )
  }

  return (
    <>
      <div className="px-2 py-1">{filterType.label}</div>

      <PopoverMenu label={en[filter.operator]}>
        <Command>
          <CommandGroup>
            {filterType.operators.map((item) => (
              <CommandItem
                key={item}
                value={item}
                onSelect={() => {
                  setOperator({ subject: filter.subject, operator: item })
                }}
              >
                {en[item]}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverMenu>

      <PopoverMenu
        label={
          filter.values.length > 1
            ? `${filter.values.length} states`
            : typeof filter.values[0] === "string"
            ? filter.values[0]
            : ""
        }
      >
        <FilterMenu path={filter.subject} />
      </PopoverMenu>

      <button
        onClick={() => {
          setFilters((filters) =>
            filters.filter((p) => p.subject != filter.subject),
          )
        }}
        className="h-full rounded-r px-2 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
      >
        <Icon name="cross-2" className="h-4 w-4" />
      </button>
    </>
  )
}

function BooleanFilter({ filter }: { filter: FilterExpression }) {
  const { setFilters } = useFilterSearch()
  const { filterTypes } = useFilterData()

  if (!(filter.subject in filterTypes)) {
    throw new Error(`Invalid filter subject: ${filter.subject}`)
  }

  const filterType = filterTypes[filter.subject as keyof typeof filterTypes]
  if (filterType.type !== "boolean") throw new Error("Invalid filter type")

  const setOperator = ({
    subject,
    operator,
  }: {
    subject: string
    operator: ComparisonOperator
  }) => {
    setFilters((filters) =>
      filters.map((p) => ({
        subject: p.subject,
        operator: p.subject === subject ? operator : p.operator,
        values: p.values,
      })),
    )
  }

  return (
    <>
      <PopoverMenu
        label={
          filter.operator === "eq"
            ? filterType.label
            : `Not ${filterType.label}`
        }
      >
        <Command>
          <CommandGroup>
            <CommandItem
              value="eq"
              onSelect={() =>
                setOperator({ subject: filter.subject, operator: "eq" })
              }
            >
              {filterType.label}
            </CommandItem>
            <CommandItem
              value="ne"
              onSelect={() =>
                setOperator({ subject: filter.subject, operator: "ne" })
              }
            >
              Not {filterType.label}
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverMenu>

      <button
        onClick={() => {
          setFilters((filters) =>
            filters.filter((p) => p.subject != filter.subject),
          )
        }}
        className="h-full rounded-r px-2 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
      >
        <Icon name="cross-2" className="h-4 w-4" />
      </button>
    </>
  )
}

function PopoverMenu({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild aria-expanded={open} role="combobox">
        <button className="px-2 py-1 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50">
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        {children}
      </PopoverContent>
    </Popover>
  )
}
