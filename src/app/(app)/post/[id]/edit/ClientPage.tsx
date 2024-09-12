'use client'
import { PostForm } from '@/components/post-form'
import { User } from 'lucia'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import {toast} from 'sonner'
import { reactClient } from 'trpc/react'

export function EditPage({ id, user }: { id: string; user: User }) {
  const router = useRouter()
  const postQuery = reactClient.post.detail.useQuery({ id: Number(id) })
  const editPostMutation = reactClient.post.edit.useMutation({
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
    onSuccess: () => {
      toast.success(user.name + " edited successfully")
    }
  })

  if (postQuery.data) {
    return (
      <>
        <Head>
          <title>Edit {postQuery.data.post.title} - Beafold</title>
        </Head>

          <>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Edit &quot;{postQuery.data.post.title}&quot;
            </h1>

            <div className="mt-6">
              <PostForm
                isSubmitting={editPostMutation.isLoading}
                defaultValues={{
                  title: postQuery.data.post.title,
                  content: postQuery.data.post.content,
                }}
                backTo={`/post/${postQuery.data.post.id}`}
                onSubmit={(values) => {
                  editPostMutation.mutate(
                    {
                      id: postQuery.data.post.id,
                      data: { title: values.title, content: values.content },
                    },
                    {
                      onSuccess: () =>
                        router.push(`/post/${postQuery.data.post.id}`),
                    }
                  )
                }}
              />
            </div>
          </>
      </>
    )
  }

  if (postQuery.isError) {
    return <div>Error: {postQuery.error.message}</div>
  }

  return (
    <div className="animate-pulse">
      <div className="w-3/4 bg-gray-200 rounded h-9 dark:bg-gray-700" />
      <div className="mt-7">
        <div>
          <div className="w-10 h-5 bg-gray-200 rounded dark:bg-gray-700" />
          <div className="border rounded h-[42px] border-secondary mt-2" />
        </div>
        <div className="mt-6">
          <div className="w-10 h-5 bg-gray-200 rounded dark:bg-gray-700" />
          <div className="mt-2 border rounded h-9 border-secondary" />
          <div className="mt-2 border rounded h-[378px] border-secondary" />
        </div>
      </div>
      <div className="flex gap-4 mt-9">
        <div className="w-[92px] bg-gray-200 rounded-full h-button dark:bg-gray-700" />
        <div className="w-20 border rounded-full h-button border-secondary" />
      </div>
    </div>
  )
}
