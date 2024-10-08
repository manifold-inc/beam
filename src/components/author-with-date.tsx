import { Avatar } from '@/components/avatar'
import type { Author } from '@/lib/types'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import Link from 'next/link'

interface AuthorWithDateProps {
  author: Author
  date: Date
}

export function AuthorWithDate({ author, date }: AuthorWithDateProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Link className="relative inline-flex" href={`/profile/${author.id}`}>
        <span className="hidden sm:flex">
          <Avatar name={author.name!} src={author.image} />
        </span>
        <span className="flex sm:hidden">
          <Avatar name={author.name!} src={author.image} size="sm" />
        </span>
      </Link>
      <div className="flex-1 text-sm sm:text-base">
        <div>
          <Link
            className="font-medium tracking-tight transition-colors hover:text-blue"
          href={`/profile/${author.id}`}>
              {author.name}
          </Link>
        </div>

        <p className="tracking-tight text-secondary">
          <time dateTime={date.toISOString()}>{formatDistanceToNow(date)}</time>{' '}
          ago
        </p>
      </div>
    </div>
  )
}
