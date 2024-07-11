'use client'
import { getQueryPaginationInput, Pagination } from '@/components/pagination'
import type { PostSummaryProps } from '@/components/post-summary'
import { PostSummarySkeleton } from '@/components/post-summary-skeleton'
import { User } from 'lucia'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { reactClient } from 'trpc/react'

const PostSummary = dynamic<PostSummaryProps>(
  () => import('@/components/post-summary').then((mod) => mod.PostSummary),
  { ssr: false }
)

const POSTS_PER_PAGE = 20

export default function ClientPage({ user }: { user: User }) {
  const params = useSearchParams()
  const currentPageNumber = Number(params.get('page') ?? 1)
  const utils = reactClient.useUtils()
  const feedQueryInput = getQueryPaginationInput(
    POSTS_PER_PAGE,
    currentPageNumber
  )
  const feedQuery = reactClient.post.feed.useQuery(feedQueryInput)
  const likeMutation = reactClient.post.like.useMutation({
    onMutate: async (likedPostId) => {
      await utils.post.feed.cancel(feedQueryInput)
      const previousQuery = utils.post.feed.getData()

      if (previousQuery) {
        utils.post.feed.setData(feedQueryInput, {
          ...previousQuery,
          posts: previousQuery.posts.map((post) =>
            post.id === likedPostId
              ? {
                ...post,
                likedBy: [
                  ...post.likedBy,
                  {
                    id: user.id,
                    name: user.name,
                  },
                ],
              }
              : post
          ),
        })
      }

      return { previousQuery }
    },
  })
  const unlikeMutation = reactClient.post.unlike.useMutation({
    onMutate: async (unlikedPostId) => {
      await utils.post.feed.cancel(feedQueryInput)

      const previousQuery = utils.post.feed.getData(feedQueryInput)

      if (previousQuery) {
        utils.post.feed.setData(feedQueryInput, {
          ...previousQuery,
          posts: previousQuery.posts.map((post) =>
            post.id === unlikedPostId
              ? {
                ...post,
                likedBy: post.likedBy.filter((item) => item.id !== user.id),
              }
              : post
          ),
        })
      }

      return { previousQuery }
    },
  })

  if (feedQuery.data) {
    return (
      <>
        {feedQuery.data.postCount === 0 ? (
          <div className="text-center text-secondary border rounded py-20 px-10">
            There are no published posts to show yet.
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-my-12 divide-y divide-primary">
              {feedQuery.data.posts.map((post) => (
                <li key={post.id} className="py-10">
                  <PostSummary
                    post={post}
                    user={user}
                    onLike={() => {
                      likeMutation.mutate(post.id)
                    }}
                    onUnlike={() => {
                      unlikeMutation.mutate(post.id)
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        <Pagination
          itemCount={feedQuery.data.postCount}
          itemsPerPage={POSTS_PER_PAGE}
          currentPageNumber={currentPageNumber}
        />
      </>
    )
  }

  if (feedQuery.isError) {
    return <div>Error: {feedQuery.error.message}</div>
  }

  return (
    <div className="flow-root">
      <ul className="-my-12 divide-y divide-primary">
        {[...Array<null>(3)].map((_, idx) => (
          <li key={idx} className="py-10">
            <PostSummarySkeleton />
          </li>
        ))}
      </ul>
    </div>
  )
}
