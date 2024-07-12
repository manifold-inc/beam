'use client'
import { Avatar } from '@/components/avatar'
import { ButtonLink } from '@/components/button-link'
import { Footer } from '@/components/footer'
import { IconButton } from '@/components/icon-button'
import { Logo, SearchIcon } from '@/components/icons'
import {
  Menu,
  MenuButton,
  MenuItemButton,
  MenuItemLink,
  MenuItems,
  MenuItemsContent,
} from '@/components/menu'
import { SearchDialog } from '@/components/search-dialog'
import { User } from 'lucia'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PropsWithChildren, useState } from 'react'

export function Layout({ children, user }: { user: User } & PropsWithChildren) {
  const { theme, themes, setTheme } = useTheme()
  const router = useRouter()
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)

  return (
    <div className="max-w-3xl px-6 mx-auto">
      <header className="flex items-center justify-between gap-4 py-12 md:py-20">
        <Link href="/">
          <Logo className="w-auto text-red-light h-[34px]" />
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <IconButton
            variant="secondary"
            onClick={() => {
              setIsSearchDialogOpen(true)
            }}
          >
            <SearchIcon className="w-4 h-4" />
          </IconButton>

          <Menu>
            <MenuButton className="relative inline-flex rounded-full group focus-ring">
              <Avatar name={user.name} src={user.image} size="sm" />
            </MenuButton>

            <MenuItems className="w-48">
              <MenuItemsContent>
                <MenuItemLink href={`/profile/${user.id}`}>
                  Profile
                </MenuItemLink>
                <MenuItemButton onClick={() => router.push('/sign-out')}>
                  Log out
                </MenuItemButton>
              </MenuItemsContent>
              <div className="flex items-center gap-4 px-4 py-3 rounded-b bg-secondary">
                <label htmlFor="theme" className="text-sm">
                  Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={theme}
                  onChange={(event) => {
                    setTheme(event.target.value)
                  }}
                  className="block w-full py-1.5 text-xs border rounded shadow-sm bg-primary border-secondary"
                >
                  {themes.map((theme) => (
                    <option key={theme} className='capitalize' value={theme}>
                      {theme}
                    </option>
                  ))}
                </select>
              </div>
            </MenuItems>
          </Menu>

          <ButtonLink href="/new">
            <span className="sm:hidden">Post</span>
            <span className="hidden sm:block shrink-0">New post</span>
          </ButtonLink>
        </div>
      </header>

      <main>{children}</main>

      <div className="py-20">
        <Footer />
      </div>

      <SearchDialog
        isOpen={isSearchDialogOpen}
        onClose={() => {
          setIsSearchDialogOpen(false)
        }}
      />
    </div>
  )
}
