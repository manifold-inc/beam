import { ButtonLink } from '@/components/button-link'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface PaginationProps {
  itemCount: number
  itemsPerPage: number
  currentPageNumber: number
}

export function getQueryPaginationInput(
  itemsPerPage: number,
  currentPageNumber: number
) {
  return {
    take: itemsPerPage,
    skip:
      currentPageNumber === 1
        ? undefined
        : itemsPerPage * (currentPageNumber - 1),
  }
}

export function Pagination({
  itemCount,
  itemsPerPage,
  currentPageNumber,
}: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(itemCount / itemsPerPage)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
 
      return params.toString()
    },
    [searchParams]
  )

  if (totalPages <= 1) {
    return null
  }
  return (
    <div className="flex justify-center gap-4 mt-12">
      <ButtonLink
        href={pathname + '?' + createQueryString('page', (currentPageNumber - 1).toString())}
        variant="secondary"
        className={
          currentPageNumber === 1 ? 'pointer-events-none opacity-50' : ''
        }
      >
        <span className="mr-1">
          <ChevronLeftIcon />
        </span>
        Newer posts
      </ButtonLink>
      <ButtonLink
        href={pathname + '?' + createQueryString('page', (currentPageNumber + 1).toString())}
        variant="secondary"
        className={
          currentPageNumber === totalPages
            ? 'pointer-events-none opacity-50'
            : ''
        }
      >
        Older posts{' '}
        <span className="ml-1">
          <ChevronRightIcon />
        </span>
      </ButtonLink>
    </div>
  )
}
