import { AuthorWithDate } from '@/components/author-with-date'
import { Banner } from '@/components/banner'
import { HtmlView } from '@/components/html-view'
import {
  ChevronRightIcon,
} from '@/components/icons'
import { classNames } from '@/lib/classnames'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { summarize } from '@/lib/text'
import Link from 'next/link'
import { inferRouterOutputs } from '@trpc/server'
import { AppRouter } from '@/server/routers/_app'
import { User } from 'lucia'
import PostSummaryTooltip from './post-summary-tooltip'

export interface PostSummaryProps {
  post: inferRouterOutputs<AppRouter>['post']['feed']['posts'][number]
  hideAuthor?: boolean
  user: User
}

export function PostSummary({
  post,
  hideAuthor = false,
  user,
}: PostSummaryProps) {
  const { summary, hasMore } = summarize(post.contentHtml)

  return (
    <div>
      {post.hidden && (
        <Banner className="mb-6">
          This post has been hidden and is only visible to administrators.
        </Banner>
      )}
      <div className={classNames(post.hidden ? 'opacity-50' : '')}>
        <Link href={`/post/${post.id}`}>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {post.title}
          </h2>
        </Link>

        <div className={classNames(hideAuthor ? 'mt-2' : 'mt-6')}>
          {hideAuthor ? (
            <p className="tracking-tight text-secondary">
              <time dateTime={post.createdAt.toISOString()}>
                {formatDistanceToNow(post.createdAt)}
              </time>{' '}
              ago
            </p>
          ) : (
            <AuthorWithDate author={post.author} date={post.createdAt} />
          )}
        </div>

        <HtmlView html={summary} className={hideAuthor ? 'mt-4' : 'mt-6'} />

        <div className="flex items-center gap-4 mt-4 clear-both">
          {hasMore && (
            <Link
              className="inline-flex items-center font-medium transition-colors text-blue"
              href={`/post/${post.id}`}
            >
              Continue reading <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          )}
          <div className="ml-auto flex gap-6">
            <PostSummaryTooltip user={user} post={post}/>
          </div>
        </div>
      </div>
    </div>
  )
}
