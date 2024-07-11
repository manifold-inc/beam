import { classNames } from '@/lib/classnames'
import {
  Menu as HMenu,
  MenuItem as HMenuItem,
  MenuButton as HMenuButton,
  Transition,
} from '@headlessui/react'
import Link from 'next/link'
import { Fragment, ReactNode } from 'react'

export function Menu({ children }: { children: ReactNode }) {
  return (
    <HMenu as="div" className="relative inline-flex">
      {children}
    </HMenu>
  )
}

export const MenuButton = HMenuButton

export function MenuItems({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <HMenuItem
        as={'div'}
        className={classNames(
          'absolute right-0 z-10 mt-2 origin-top-right border divide-y rounded shadow-lg bg-primary divide-primary top-full focus:outline-none',
          className
        )}
      >
        {children}
      </HMenuItem>
    </Transition>
  )
}

export function MenuItemsContent({ children }: { children: ReactNode }) {
  return <div className="py-2">{children}</div>
}

export function menuItemClasses({
  active,
  className,
}: {
  active: boolean
  className?: string
}) {
  return classNames(
    active && 'bg-secondary',
    'block w-full text-left px-4 py-2 text-sm text-primary transition-colors',
    className
  )
}

export function MenuItemLink({
  className,
  href,
  children,
}: {
  className?: string
  href: string
  children: ReactNode
}) {
  return (
    <HMenuItem as='div'>
      {({ focus }) => (
        <Link
          href={href}
          className={menuItemClasses({ active: focus, className })}
        >
          {children}
        </Link>
      )}
    </HMenuItem>
  )
}

export function MenuItemButton({
  className,
  children,
  onClick,
}: {
  className?: string
  children: ReactNode
  onClick: () => void
}) {
  return (
    <HMenuItem>
      {({ focus }) => (
        <button
          type="button"
          className={menuItemClasses({ active: focus, className })}
          onClick={onClick}
        >
          {children}
        </button>
      )}
    </HMenuItem>
  )
}
