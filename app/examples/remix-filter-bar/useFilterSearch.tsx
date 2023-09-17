import { useCallback } from "react"
import { useSearchParams } from "@remix-run/react"
import type { GroupedExpression } from "odata-qs"
import { groupValues, isOperator, joinTree, parse, serialize } from "odata-qs"

export type FilterExpression = Omit<GroupedExpression, "values"> & {
  values: string[]
}

export function useFilterSearch() {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get("q")

  const groups = groupValues(parse(query, "and")).map((group) => ({
    ...group,
    // Client side we just want to deal with strings
    values: group.values.map((value) => String(value)),
  }))

  const setFilters = useCallback(
    (fn: (input: FilterExpression[]) => FilterExpression[]) => {
      const newFilters = fn(groups)
        .filter(({ values }) => values.length > 0)
        .flatMap((p) => {
          if (!isOperator(p.operator))
            throw new Error(`Invalid operator: ${p.operator}`)

          return p.values.map((value) => ({
            subject: p.subject,
            operator: p.operator,
            value,
          }))
        })
        .filter(Boolean)

      if (newFilters.length === 0) {
        return setSearchParams((prev) => {
          prev.delete("q")
          return prev
        })
      }

      const finalQuery = joinTree(newFilters, "and")

      return setSearchParams((prev) => {
        if (finalQuery) {
          prev.set("q", serialize(finalQuery))
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
