import { Link, useSearchParams } from "@remix-run/react"
import { Icon } from "~/components/icon.tsx"
import { Button } from "~/components/ui/button.tsx"

function setSearchParamsString(
  searchParams: URLSearchParams,
  changes: Record<string, string | number | undefined>,
) {
  const newSearchParams = new URLSearchParams(searchParams)

  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined) {
      newSearchParams.delete(key)
      continue
    }

    newSearchParams.set(key, String(value))
  }

  // Print string manually to avoid over-encoding the URL
  // Browsers are ok with $ nowadays
  return Array.from(newSearchParams.entries())
    .map(([key, value]) =>
      value ? `${key}=${encodeURIComponent(value)}` : key,
    )
    .join("&")
}

export function PaginationBar({ total }: { total: number }) {
  const [searchParams] = useSearchParams()
  const $skip = Number(searchParams.get("$skip")) || 0
  const $top = Number(searchParams.get("$top")) || 10

  const totalPages = Math.ceil(total / $top)
  const currentPage = Math.floor($skip / $top) + 1
  const maxPages = 5
  const halfMaxPages = Math.floor(maxPages / 2)

  const canPageBackwards = $skip > 0
  const canPageForwards = $skip + $top < total

  const pageNumbers = [] as Array<number>
  if (totalPages <= maxPages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i)
    }
  } else {
    let startPage = currentPage - halfMaxPages
    let endPage = currentPage + halfMaxPages

    if (startPage < 1) {
      endPage += Math.abs(startPage) + 1
      startPage = 1
    }

    if (endPage > totalPages) {
      startPage -= endPage - totalPages
      endPage = totalPages
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button size="xs" variant="outline" asChild disabled={!canPageBackwards}>
        <Link
          to={{
            search: setSearchParamsString(searchParams, {
              $skip: 0,
            }),
          }}
          preventScrollReset
          prefetch="intent"
          className="text-neutral-600"
        >
          <span className="sr-only"> First page</span>
          <Icon name="double-arrow-left" />
        </Link>
      </Button>

      <Button size="xs" variant="outline" asChild disabled={!canPageBackwards}>
        <Link
          to={{
            search: setSearchParamsString(searchParams, {
              $skip: Math.max($skip - $top, 0),
            }),
          }}
          preventScrollReset
          prefetch="intent"
          className="text-neutral-600"
        >
          <span className="sr-only"> Previous page</span>
          <Icon name="arrow-left" />
        </Link>
      </Button>

      {pageNumbers.map((pageNumber) => {
        const pageSkip = (pageNumber - 1) * $top
        const isCurrentPage = pageNumber === currentPage

        if (isCurrentPage) {
          return (
            <Button
              size="xs"
              variant="ghost"
              key={`${pageNumber}-active`}
              className="grid min-w-[2rem] place-items-center bg-neutral-200 text-sm text-black"
            >
              <div>
                <span className="sr-only">Page {pageNumber}</span>
                <span>{pageNumber}</span>
              </div>
            </Button>
          )
        } else {
          return (
            <Button size="xs" variant="ghost" asChild key={pageNumber}>
              <Link
                to={{
                  search: setSearchParamsString(searchParams, {
                    $skip: pageSkip,
                  }),
                }}
                preventScrollReset
                prefetch="intent"
                className="min-w-[2rem] font-normal text-neutral-600"
              >
                {pageNumber}
              </Link>
            </Button>
          )
        }
      })}

      <Button size="xs" variant="outline" asChild disabled={!canPageForwards}>
        <Link
          to={{
            search: setSearchParamsString(searchParams, {
              $skip: $skip + $top,
            }),
          }}
          preventScrollReset
          prefetch="intent"
          className="text-neutral-600"
        >
          <span className="sr-only"> Next page</span>
          <Icon name="arrow-right" />
        </Link>
      </Button>

      <Button size="xs" variant="outline" asChild disabled={!canPageForwards}>
        <Link
          to={{
            search: setSearchParamsString(searchParams, {
              $skip: (totalPages - 1) * $top,
            }),
          }}
          preventScrollReset
          prefetch="intent"
          className="text-neutral-600"
        >
          <span className="sr-only"> Last page</span>
          <Icon name="double-arrow-right" />
        </Link>
      </Button>
    </div>
  )
}
