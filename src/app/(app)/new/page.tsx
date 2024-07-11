'use client'
import { PostForm } from '@/components/post-form'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import {toast} from 'sonner'
import { reactClient } from 'trpc/react'

export default function Page(){
  const router = useRouter()
  const addPostMutation = reactClient.post.add.useMutation({
    onSuccess: (id) => router.push(`/post/${id}`),
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })

  return (
    <>
      <Head>
        <title>New Post - Beam</title>
      </Head>

      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
        New post
      </h1>

      <div className="mt-6">
        <PostForm
          isSubmitting={addPostMutation.isLoading}
          defaultValues={{
            title: '',
            content: '',
          }}
          backTo="/"
          onSubmit={(values) => {
            addPostMutation.mutate({
              title: values.title,
              content: values.content,
            })
          }}
        />
      </div>
    </>
  )
}
