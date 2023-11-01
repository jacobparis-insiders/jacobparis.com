import { Form, useSearchParams } from "@remix-run/react"
import { Icon } from "~/components/icon.tsx"
import { Button } from "~/components/ui/button.tsx"

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

  const existingParams = Array.from(searchParams.entries()).filter(([key]) => {
    return key !== "$skip" && key !== "$top"
  })

  return (
    <Form method="GET" className="flex items-center gap-1" preventScrollReset>
      <>
        {[["$top", String($top)], ...existingParams].map(([key, value]) => {
          return <input key={key} type="hidden" name={key} value={value} />
        })}
      </>

      <Button
        variant="outline"
        size="xs"
        type="submit"
        name="$skip"
        className="text-neutral-600"
        value="0"
        disabled={!canPageBackwards}
        aria-label="First page"
      >
        <Icon name="double-arrow-left" />
      </Button>

      <Button
        variant="outline"
        size="xs"
        type="submit"
        name="$skip"
        className="text-neutral-600"
        value={Math.max($skip - $top, 0)}
        disabled={!canPageBackwards}
        aria-label="Previous page"
      >
        <Icon name="arrow-left" />
      </Button>

      {pageNumbers.map((pageNumber) => {
        const pageSkip = (pageNumber - 1) * $top
        const isCurrentPage = pageNumber === currentPage
        const isValidPage = pageSkip >= 0 && pageSkip < total

        if (isCurrentPage) {
          return (
            <Button
              variant="ghost"
              size="xs"
              type="submit"
              name="$skip"
              className="min-w-[2rem] bg-neutral-200 text-black"
              key={`${pageNumber}-active`}
              value={pageSkip}
              aria-label={`Page ${pageNumber}`}
              disabled={!isValidPage}
            >
              {pageNumber}
            </Button>
          )
        } else {
          return (
            <Button
              variant="ghost"
              size="xs"
              type="submit"
              className="min-w-[2rem] font-normal text-neutral-600"
              name="$skip"
              key={pageNumber}
              value={pageSkip}
              aria-label={`Page ${pageNumber}`}
              disabled={!isValidPage}
            >
              {pageNumber}
            </Button>
          )
        }
      })}

      <Button
        variant="outline"
        size="xs"
        type="submit"
        name="$skip"
        className="text-neutral-600"
        value={Math.min($skip + $top, total - $top + 1)}
        disabled={!canPageForwards}
        aria-label="Next page"
      >
        <Icon name="arrow-right" />
      </Button>

      <Button
        variant="outline"
        size="xs"
        type="submit"
        name="$skip"
        className="text-neutral-600"
        value={(totalPages - 1) * $top}
        disabled={!canPageForwards}
        aria-label="Last page"
      >
        <Icon name="double-arrow-right" />
      </Button>
    </Form>
  )
}
