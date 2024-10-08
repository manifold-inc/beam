import { SearchIcon, SpinnerIcon } from '@/components/icons'
import { classNames } from '@/lib/classnames'
import { AppRouter } from '@/server/routers/_app'
import { Dialog, Transition, TransitionChild } from '@headlessui/react'
import { inferRouterOutputs } from '@trpc/server'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ForwardedRef, forwardRef, Fragment, useEffect, useRef, useState } from 'react'

import { reactClient } from 'trpc/react'
import { useDebounce } from 'use-debounce'
import { ItemOptions, useItemList } from 'use-item-list'

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
}

function SearchResult({
  useItem,
  result,
}: {
  useItem: ({ ref, text, value, disabled }: ItemOptions) => {
    id: string
    index: number
    highlight: () => void
    select: () => void
    selected: unknown

    // Who knows...
    // eslint-disable-next-line
    useHighlighted: () => Boolean
  }
  result: inferRouterOutputs<AppRouter>['post']['search'][number]
}) {
  const ref = useRef<HTMLLIElement>(null)
  const { id, highlight, select, useHighlighted } = useItem({
    ref,
    value: result,
  })
  const highlighted = useHighlighted()

  return (
    <li ref={ref} id={id} onMouseEnter={highlight} onClick={select}>
      <Link
        href={`/post/${result.id}`}
        className={classNames(
          'block py-3.5 pl-10 pr-3 transition-colors leading-tight',
          highlighted && 'bg-blue-600 text-white'
        )}
      >
        {result.title}
      </Link>
    </li>
  )
}

const SearchField = forwardRef(function SField({
  onSelect,
}: {
  onSelect: () => void
}, ref: ForwardedRef<HTMLInputElement>) {
  const [value, setValue] = useState('')
  const [debouncedValue] = useDebounce(value, 500)
  const router = useRouter()

  const feedQuery = reactClient.post.search.useQuery(
    {
      query: debouncedValue,
    },
    {
      enabled: debouncedValue.trim().length > 0,
    }
  )

  const { moveHighlightedItem, selectHighlightedItem, useItem } = useItemList({
    onSelect: (item: { value: { id: string } }) => {
      void router.push(`/post/${item.value.id}`)
      onSelect()
    },
  })

  useEffect(() => {
    function handleKeydownEvent(event: KeyboardEvent) {
      const { code } = event

      if (code === 'ArrowUp' || code === 'ArrowDown' || code === 'Enter') {
        event.preventDefault()
      }

      if (code === 'ArrowUp') {
        moveHighlightedItem(-1)
      }

      if (code === 'ArrowDown') {
        moveHighlightedItem(1)
      }

      if (code === 'Enter') {
        selectHighlightedItem()
      }
    }

    document.addEventListener('keydown', handleKeydownEvent)
    return () => {
      document.removeEventListener('keydown', handleKeydownEvent)
    }
  }, [moveHighlightedItem, selectHighlightedItem, router])

  return (
    <div>
      <div className="relative">
        <div
          className={classNames(
            'absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-opacity',
            feedQuery.isLoading && debouncedValue.length > 0 ? 'opacity-100' : 'opacity-0'
          )}
        >
          <SpinnerIcon className="w-4 h-4 animate-spin" />
        </div>
        <div
          className={classNames(
            'absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-opacity',
            feedQuery.isLoading && debouncedValue.length > 0 ? 'opacity-0' : 'opacity-100'
          )}
        >
          <SearchIcon className="w-4 h-4" aria-hidden="true" />
        </div>
        <input
          type="text"
          autoComplete="off"
          autoCorrect="off"
          ref={ref}
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Search"
          className="block w-full py-3 pl-10 bg-transparent border-0 focus:ring-0"
          role="combobox"
          aria-controls="search-results"
          aria-expanded={true}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
          }}
        />
      </div>
      {feedQuery.data &&
        (feedQuery.data.length > 0 ? (
          <ul
            id="search-results"
            role="listbox"
            className="max-h-[286px] border-t overflow-y-auto"
          >
            {feedQuery.data.map((result) => (
              <SearchResult key={result.id} useItem={useItem} result={result} />
            ))}
          </ul>
        ) : (
          <div className="border-t py-3.5 px-3 text-center leading-tight">
            No results. Try something else
          </div>
        ))}
      {feedQuery.isError && (
        <div className="border-t py-3.5 px-3 text-center leading-tight">
          Error: {feedQuery.error.message}
        </div>
      )}
    </div>
  )
})

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const searchRef = useRef<HTMLInputElement>(null)
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-50"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 transition-opacity bg-gray-700 opacity-90 dark:bg-gray-900" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-50"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            afterEnter={() => searchRef.current?.focus()}
          >
            <div className="inline-block w-full max-w-md mt-[10vh] mb-8 overflow-hidden text-left align-middle transition-all transform bg-primary rounded-lg shadow-xl dark:border">
              {isOpen ? (
                <SearchField ref={searchRef} onSelect={onClose} />
              ) : (
                <div className="h-12" />
              )}
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
