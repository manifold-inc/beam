'use client'
import { HeartFilledIcon, HeartIcon, MessageIcon } from '@/components/icons'
import { MAX_LIKED_BY_SHOWN } from '@/components/like-button'
import { classNames } from '@/lib/classnames'
import { AppRouter } from '@/server/routers/_app'
import * as Tooltip from '@radix-ui/react-tooltip'
import { inferRouterOutputs } from '@trpc/server'
import { User } from 'lucia'

export default function PostSummaryTooltip({
  post,
  user,
}: {
  post: inferRouterOutputs<AppRouter>['post']['feed']['posts'][number],
  user: User
}) {
  const isLikedByCurrentUser = Boolean(
    post.likedBy?.find((item) => item.id === user.id)
  )
  const likeCount = post.likedBy?.length ?? 0

  return (
    <>
      <Tooltip.Root delayDuration={300}>
        <Tooltip.Trigger
          asChild
          onClick={(event) => {
            event.preventDefault()
          }}
          onMouseDown={(event) => {
            event.preventDefault()
          }}
        >
          <div className="inline-flex items-center gap-1.5">
            {isLikedByCurrentUser ? (
              <HeartFilledIcon className="w-4 h-4 text-red" />
            ) : (
              <HeartIcon className="w-4 h-4 text-red" />
            )}
            <span className="text-sm font-semibold tabular-nums">
              {likeCount}
            </span>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content
          side="bottom"
          sideOffset={4}
          className={classNames(
            'max-w-[260px] px-3 py-1.5 rounded shadow-lg bg-secondary-inverse text-secondary-inverse sm:max-w-sm',
            likeCount === 0 && 'hidden'
          )}
        >
          <p className="text-sm">
            {post.likedBy
              ?.slice(0, MAX_LIKED_BY_SHOWN)
              .map((item) => (item.id === user.id ? 'You' : item.name))
              .join(', ')}
            {likeCount > MAX_LIKED_BY_SHOWN &&
              ` and ${likeCount - MAX_LIKED_BY_SHOWN} more`}
          </p>
          <Tooltip.Arrow
            offset={22}
            className="fill-gray-800 dark:fill-gray-50"
          />
        </Tooltip.Content>
      </Tooltip.Root>

      <div className="inline-flex items-center gap-1.5">
        <MessageIcon className="w-4 h-4 text-secondary" />
        <span className="text-sm font-semibold tabular-nums">
          {post.comments}
        </span>
      </div>
    </>
  )
}
