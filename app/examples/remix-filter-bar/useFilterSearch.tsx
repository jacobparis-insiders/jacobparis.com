import { useSearchParams } from "@remix-run/react"
import type { GroupedExpression } from "odata-qs"
import { getValuesFromMap, parse, stringify } from "odata-qs"
import { useCallback } from "react"

export type FilterExpression = Omit<GroupedExpression, "values"> & {
  values: string[]
}

export function useFilterSearch() {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get("q")

  const groups = getValuesFromMap(parse(query)).map((group) => ({
    ...group,
    // Client side we just want to deal with strings
    values: group.values.map((value) => String(value)),
  }))

  const setFilters = useCallback(
    (fn: (input: FilterExpression[]) => FilterExpression[]) => {
      const finalQuery = stringify(fn(groups))

      return setSearchParams((prev) => {
        if (finalQuery) {
          prev.set("q", finalQuery)
        } else {
          prev.delete("q")
        }
        return prev
      })
    },
    [groups, setSearchParams],
  )

  const replaceFilter = useCallback(
    ({ subject, operator, values }: FilterExpression) =>
      setFilters((filters) => {
        const existingFilter = filters.find(
          (filter) => filter.subject === subject,
        )

        if (existingFilter) {
          return filters.map((filter) =>
            filter.subject === subject
              ? {
                  ...filter,
                  values,
                }
              : filter,
          )
        }

        return [
          ...filters,
          {
            subject,
            operator,
            values,
          },
        ]
      }),
    [setFilters],
  )

  return {
    filters: groups,
    setFilters,
    replaceFilter,
  }
}
