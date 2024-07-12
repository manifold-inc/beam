import { validateRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { serverClient } from 'trpc/server'
import { getQueryPaginationInput } from '@/server/utils'
import { Pagination } from '@/components/pagination'
import { PostSummary } from '@/components/post-summary'

const POSTS_PER_PAGE = 20
export const revalidate = 0
export default async function Page({
  searchParams,
}: {
  searchParams: { page: string }
}) {
  const {user} = await validateRequest()
  if (!user) redirect('/sign-in')

  const currentPageNumber = Number(searchParams.page ?? '1')
  const feedQueryInput = getQueryPaginationInput(
    POSTS_PER_PAGE,
    currentPageNumber
  )
  const feed = await serverClient.post.feed.query(feedQueryInput)
  return (
    <>
      {feed.postCount === 0 ? (
        <div className="text-center text-secondary border rounded py-20 px-10">
          There are no published posts to show yet.
        </div>
      ) : (
        <div className="flow-root">
          <ul className="-my-12 divide-y divide-primary">
            {feed.posts.map((post) => (
              <li key={post.id} className="py-10">
                <PostSummary
                  post={post}
                  user={user}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      <Pagination
        itemCount={feed.postCount}
        itemsPerPage={POSTS_PER_PAGE}
        currentPageNumber={currentPageNumber}
      />
    </>
  )
}
