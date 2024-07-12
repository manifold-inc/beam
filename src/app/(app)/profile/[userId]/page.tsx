import { validateRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProfileInfo } from './ClientPages'
import { serverClient } from 'trpc/server'
import { getQueryPaginationInput } from '@/server/utils'
import { Pagination } from '@/components/pagination'
import { PostSummary } from '@/components/post-summary'

const POSTS_PER_PAGE = 20
export const revalidate = 0
export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: { userId: string }
  searchParams: { page: string }
}) {
  const { user } = await validateRequest()
  if (!user) redirect('/sign-in')
  const profile = await serverClient.user.profile.query({ id: params.userId })
  const feed = await serverClient.post.feed.query({
    authorId: params.userId,
    ...getQueryPaginationInput(POSTS_PER_PAGE, Number(searchParams.page ?? 1)),
  })
  return (
    <>
      <ProfileInfo user={profile} isSelf={profile.id === user.id} />
      <div className="flow-root mt-28">
        {feed.postCount === 0 ? (
          <div className="text-center text-secondary border rounded py-20 px-10">
            This user hasn&apos;t published any posts yet.
          </div>
        ) : (
          <ul className="-my-12 divide-y divide-primary">
            {feed.posts.map((post) => (
              <li key={post.id} className="py-10">
                <PostSummary user={user} hideAuthor post={post} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pagination
        itemCount={feed.postCount}
        itemsPerPage={POSTS_PER_PAGE}
        currentPageNumber={Number(searchParams.page ?? 1)}
      />
    </>
  )
}
