import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/frontend/ui/pagination"

type BlogPaginationProps = {
  currentPage: number
  lastPage: number
  basePath?: string
  perPage?: number
}

function getPageHref(basePath: string, page: number, perPage?: number) {
  const params = new URLSearchParams()
  if (page > 1) {
    params.set("page", String(page))
  }
  if (perPage && perPage > 0) {
    params.set("per_page", String(perPage))
  }
  const query = params.toString()
  if (page <= 1) {
    return query ? `${basePath}?${query}` : basePath
  }
  return `${basePath}?${query}`
}

export function BlogPagination({
  currentPage,
  lastPage,
  basePath = "/blog",
  perPage,
}: BlogPaginationProps) {
  if (lastPage <= 1) {
    return null
  }

  const pages: number[] = []
  const start = Math.max(1, currentPage - 1)
  const end = Math.min(lastPage, currentPage + 1)

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  const showLeftEllipsis = start > 2
  const showRightEllipsis = end < lastPage - 1

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={getPageHref(basePath, Math.max(1, currentPage - 1), perPage)}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        <PaginationItem>
          <PaginationLink
            href={getPageHref(basePath, 1, perPage)}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>

        {showLeftEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {pages
          .filter((page) => page !== 1 && page !== lastPage)
          .map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href={getPageHref(basePath, page, perPage)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

        {showRightEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {lastPage > 1 && (
          <PaginationItem>
            <PaginationLink
              href={getPageHref(basePath, lastPage, perPage)}
              isActive={currentPage === lastPage}
            >
              {lastPage}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            href={getPageHref(
              basePath,
              Math.min(lastPage, currentPage + 1),
              perPage,
            )}
            aria-disabled={currentPage === lastPage}
            className={
              currentPage === lastPage ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
