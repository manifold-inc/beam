'use client'
import { AuthorWithDate } from '@/components/author-with-date'
import { Avatar } from '@/components/avatar'
import { Banner } from '@/components/banner'
import { Button } from '@/components/button'
import { ButtonLink } from '@/components/button-link'
import {
  Dialog,
  DialogActions,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/dialog'
import { HtmlView } from '@/components/html-view'
import { IconButton } from '@/components/icon-button'
import {
  DotsIcon,
  EditIcon,
  EyeClosedIcon,
  EyeIcon,
  MessageIcon,
  TrashIcon,
} from '@/components/icons'
import { LikeButton } from '@/components/like-button'
import { MarkdownEditor } from '@/components/markdown-editor'
import {
  Menu,
  MenuButton,
  MenuItemButton,
  MenuItems,
  MenuItemsContent,
} from '@/components/menu'
import { AppRouter } from '@/server/routers/_app'
import { inferRouterOutputs } from '@trpc/server'
import { User } from 'lucia'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import {Fragment, useRef, useState} from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import {toast} from 'sonner'
import { reactClient } from 'trpc/react'

export function PostPage({id, user}: {id: string, user: User}){
  const router = useRouter()
  const utils = reactClient.useUtils()
  const postQueryInput = {id: Number(id)}
  const postQuery = reactClient.post.detail.useQuery(postQueryInput)
  const likeMutation = reactClient.post.like.useMutation({
    onMutate: async () => {
      await utils.post.detail.cancel(postQueryInput)

      const previousPost = utils.post.detail.getData(postQueryInput)

      if (previousPost) {
        utils.post.detail.setData(postQueryInput, {
          ...previousPost,
          likes: [
            ...previousPost.likes,
            { id: user.id, name: user.name },
          ],
        })
      }

      return { previousPost }
    },
  })
  const unlikeMutation = reactClient.post.unlike.useMutation({
    onMutate: async () => {
      await utils.post.detail.cancel(postQueryInput)

      const previousPost = utils.post.detail.getData(postQueryInput)

      if (previousPost) {
        utils.post.detail.setData(postQueryInput, {
          ...previousPost,
          likes: previousPost.likes.filter(
            (item) => item.id !== user.id
          ),
        })
      }

      return { previousPost }
    },
  })
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState(false)
  const [isConfirmHideDialogOpen, setIsConfirmHideDialogOpen] =
    useState(false)
  const [isConfirmUnhideDialogOpen, setIsConfirmUnhideDialogOpen] =
    useState(false)

  function handleHide() {
    setIsConfirmHideDialogOpen(true)
  }

  function handleUnhide() {
    setIsConfirmUnhideDialogOpen(true)
  }

  function handleEdit() {
    router.push(`/post/${postQuery.data?.post.id}/edit`)
  }

  function handleDelete() {
    setIsConfirmDeleteDialogOpen(true)
  }

  if (postQuery.data) {
    const isUserAdmin = user.role === 'ADMIN'
    const postBelongsToUser = postQuery.data.post.author.id === user.id

    return (
      <>
        <Head>
          <title>{postQuery.data.post.title} - Beafold</title>
        </Head>

        <article className="divide-y divide-primary">
          <div className="pb-12">
            {postQuery.data.post.hidden && (
              <Banner className="mb-6">
                This post has been hidden and is only visible to administrators.
              </Banner>
            )}

            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-semibold tracking-tighter md:text-4xl">
                {postQuery.data.post.title}
              </h1>
              {(postBelongsToUser || isUserAdmin) && (
                <>
                  <div className="flex md:hidden">
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        variant="secondary"
                        title="More"
                      >
                        <DotsIcon className="w-4 h-4" />
                      </MenuButton>

                      <MenuItems className="w-28">
                        <MenuItemsContent>
                          {isUserAdmin &&
                            (postQuery.data.post.hidden ? (
                              <MenuItemButton onClick={handleUnhide}>
                                Unhide
                              </MenuItemButton>
                            ) : (
                              <MenuItemButton onClick={handleHide}>
                                Hide
                              </MenuItemButton>
                            ))}
                          {postBelongsToUser && (
                            <>
                              <MenuItemButton onClick={handleEdit}>
                                Edit
                              </MenuItemButton>
                              <MenuItemButton
                                className="!text-red"
                                onClick={handleDelete}
                              >
                                Delete
                              </MenuItemButton>
                            </>
                          )}
                        </MenuItemsContent>
                      </MenuItems>
                    </Menu>
                  </div>
                  <div className="hidden md:flex md:gap-4">
                    {isUserAdmin &&
                      (postQuery.data.post.hidden ? (
                        <IconButton
                          variant="secondary"
                          title="Unhide"
                          onClick={handleUnhide}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </IconButton>
                      ) : (
                        <IconButton
                          variant="secondary"
                          title="Hide"
                          onClick={handleHide}
                        >
                          <EyeClosedIcon className="w-4 h-4" />
                        </IconButton>
                      ))}
                    {postBelongsToUser && (
                      <>
                        <IconButton
                          variant="secondary"
                          title="Edit"
                          onClick={handleEdit}
                        >
                          <EditIcon className="w-4 h-4" />
                        </IconButton>
                        <IconButton
                          variant="secondary"
                          title="Delete"
                          onClick={handleDelete}
                        >
                          <TrashIcon className="w-4 h-4 text-red" />
                        </IconButton>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="mt-6">
              <AuthorWithDate
                author={postQuery.data.post.author}
                date={postQuery.data.post.createdAt}
              />
            </div>
            <HtmlView html={postQuery.data.post.contentHtml} className="mt-8" />
            <div className="flex gap-4 mt-6 clear-both">
              <LikeButton
                likedBy={postQuery.data.likes}
                user={user}
                onLike={() => {
                  likeMutation.mutate(postQuery.data.post.id)
                }}
                onUnlike={() => {
                  unlikeMutation.mutate(postQuery.data.post.id)
                }}
              />
              <ButtonLink
                href={`/post/${postQuery.data.post.id}#comments`}
                variant="secondary"
              >
                <MessageIcon className="w-4 h-4 text-secondary" />
                <span className="ml-1.5">{postQuery.data.comments.length}</span>
              </ButtonLink>
            </div>
          </div>

          <div id="comments" className="pt-12 space-y-12">
            {postQuery.data.comments.length > 0 && (
              <ul className="space-y-12">
                {postQuery.data.comments.map((comment) => (
                  <li key={comment.id}>
                    <Comment user={user} postId={postQuery.data.post.id} comment={comment} />
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-start gap-2 sm:gap-4">
              <span className="hidden sm:inline-block">
                <Avatar name={user.name} src={user.image} />
              </span>
              <span className="inline-block sm:hidden">
                <Avatar
                  name={user.name}
                  src={user.image}
                  size="sm"
                />
              </span>
              <AddCommentForm postId={postQuery.data.post.id} />
            </div>
          </div>
        </article>

        <ConfirmDeleteDialog
          postId={postQuery.data.post.id}
          isOpen={isConfirmDeleteDialogOpen}
          onClose={() => {
            setIsConfirmDeleteDialogOpen(false)
          }}
        />

        <ConfirmHideDialog
          postId={postQuery.data.post.id}
          isOpen={isConfirmHideDialogOpen}
          onClose={() => {
            setIsConfirmHideDialogOpen(false)
          }}
        />

        <ConfirmUnhideDialog
          postId={postQuery.data.post.id}
          isOpen={isConfirmUnhideDialogOpen}
          onClose={() => {
            setIsConfirmUnhideDialogOpen(false)
          }}
        />
      </>
    )
  }

  if (postQuery.isError) {
    return <div>Error: {postQuery.error.message}</div>
  }

  return (
    <div className="animate-pulse">
      <div className="w-3/4 bg-gray-200 rounded h-9 dark:bg-gray-700" />
      <div className="flex items-center gap-4 mt-6">
        <div className="w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-700" />
        <div className="flex-1">
          <div className="w-24 h-4 bg-gray-200 rounded dark:bg-gray-700" />
          <div className="w-32 h-3 mt-2 bg-gray-200 rounded dark:bg-gray-700" />
        </div>
      </div>
      <div className="space-y-3 mt-7">
        {[...Array<null>(3)].map((_, idx) => (
          <Fragment key={idx}>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-5 col-span-2 bg-gray-200 rounded dark:bg-gray-700" />
              <div className="h-5 col-span-1 bg-gray-200 rounded dark:bg-gray-700" />
            </div>
            <div className="w-1/2 h-5 bg-gray-200 rounded dark:bg-gray-700" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-5 col-span-1 bg-gray-200 rounded dark:bg-gray-700" />
              <div className="h-5 col-span-2 bg-gray-200 rounded dark:bg-gray-700" />
            </div>
            <div className="w-3/5 h-5 bg-gray-200 rounded dark:bg-gray-700" />
          </Fragment>
        ))}
      </div>
      <div className="flex gap-4 mt-6">
        <div className="w-16 border rounded-full h-button border-secondary" />
        <div className="w-16 border rounded-full h-button border-secondary" />
      </div>
    </div>
  )
}

function Comment({
  postId,
  comment,
  user,
}: {
  postId: number
  comment: inferRouterOutputs<AppRouter>['post']['detail']['comments'][number]
  user: User
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState(false)

  const commentBelongsToUser = comment.author.id === user.id

  if (isEditing) {
    return (
      <div className="flex items-start gap-4">
        <Avatar name={comment.author.name!} src={comment.author.image} />
        <EditCommentForm
          postId={postId}
          comment={comment}
          onDone={() => {
            setIsEditing(false)
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <AuthorWithDate author={comment.author} date={comment.createdAt} />
        {commentBelongsToUser && (
          <Menu>
            <MenuButton as={IconButton} variant="secondary" title="More">
              <DotsIcon className="w-4 h-4" />
            </MenuButton>

            <MenuItems className="w-28">
              <MenuItemsContent>
                <MenuItemButton
                  onClick={() => {
                    setIsEditing(true)
                  }}
                >
                  Edit
                </MenuItemButton>
                <MenuItemButton
                  className="!text-red"
                  onClick={() => {
                    setIsConfirmDeleteDialogOpen(true)
                  }}
                >
                  Delete
                </MenuItemButton>
              </MenuItemsContent>
            </MenuItems>
          </Menu>
        )}
      </div>

      <div className="mt-4 pl-11 sm:pl-16">
        <HtmlView html={comment.contentHtml} />
      </div>

      <ConfirmDeleteCommentDialog
        postId={postId}
        commentId={comment.id}
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => {
          setIsConfirmDeleteDialogOpen(false)
        }}
      />
    </div>
  )
}

interface CommentFormData {
  content: string
}

function AddCommentForm({ postId }: { postId: number }) {
  const [markdownEditorKey, setMarkdownEditorKey] = useState(0)
  const utils = reactClient.useUtils()
  const addCommentMutation = reactClient.comment.add.useMutation({
    onSuccess: () => {
      return utils.post.detail.invalidate({id: postId})
    },
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })
  const { control, handleSubmit, reset } = useForm<CommentFormData>()

  const onSubmit: SubmitHandler<CommentFormData> = (data) => {
    addCommentMutation.mutate(
      {
        postId,
        content: data.content,
      },
      {
        onSuccess: () => {
          reset({ content: '' })
          setMarkdownEditorKey((markdownEditorKey) => markdownEditorKey + 1)
        },
      }
    )
  }

  return (
    <form className="flex-1" onSubmit={void handleSubmit(onSubmit)}>
      <Controller
        name="content"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <MarkdownEditor
            key={markdownEditorKey}
            value={field.value}
            onChange={field.onChange}
            onTriggerSubmit={void handleSubmit(onSubmit)}
            required
            placeholder="Comment"
            minRows={4}
          />
        )}
      />
      <div className="mt-4">
        <Button
          type="submit"
          isLoading={addCommentMutation.isLoading}
          loadingChildren="Adding comment"
        >
          Add comment
        </Button>
      </div>
    </form>
  )
}

function EditCommentForm({
  postId,
  comment,
  onDone,
}: {
  postId: number
  comment: inferRouterOutputs<AppRouter>['post']['detail']['comments'][number]
  onDone: () => void
}) {
  const utils = reactClient.useUtils()
  const editCommentMutation = reactClient.comment.edit.useMutation({
    onSuccess: () => {
      return utils.post.detail.invalidate({id: postId})
    },
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })
  const { control, handleSubmit } = useForm<CommentFormData>({
    defaultValues: {
      content: comment.content,
    },
  })

  const onSubmit: SubmitHandler<CommentFormData> = (data) => {
    editCommentMutation.mutate(
      {
        id: comment.id,
        data: {
          content: data.content,
        },
      },
      {
        onSuccess: () => onDone(),
      }
    )
  }

  return (
    <form className="flex-1" onSubmit={void handleSubmit(onSubmit)}>
      <Controller
        name="content"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <MarkdownEditor
            value={field.value}
            onChange={field.onChange}
            onTriggerSubmit={void handleSubmit(onSubmit)}
            required
            placeholder="Comment"
            minRows={4}
            autoFocus
          />
        )}
      />
      <div className="flex gap-4 mt-4">
        <Button
          type="submit"
          isLoading={editCommentMutation.isLoading}
          loadingChildren="Updating comment"
        >
          Update comment
        </Button>
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function ConfirmDeleteCommentDialog({
  postId,
  commentId,
  isOpen,
  onClose,
}: {
  postId: number
  commentId: number
  isOpen: boolean
  onClose: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const utils = reactClient.useUtils()
  const deleteCommentMutation = reactClient.comment.delete.useMutation({
    onSuccess: () => {
      return utils.post.detail.invalidate({id: postId})
    },
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })

  return (
    <Dialog isOpen={isOpen} onClose={onClose} initialFocus={cancelRef}>
      <DialogContent>
        <DialogTitle>Delete comment</DialogTitle>
        <DialogDescription className="mt-6">
          Are you sure you want to delete this comment?
        </DialogDescription>
        <DialogCloseButton onClick={onClose} />
      </DialogContent>
      <DialogActions>
        <Button
          variant="secondary"
          className="!text-red"
          isLoading={deleteCommentMutation.isLoading}
          loadingChildren="Deleting comment"
          onClick={() => {
            deleteCommentMutation.mutate(commentId, {
              onSuccess: () => onClose(),
            })
          }}
        >
          Delete comment
        </Button>
        <Button variant="secondary" onClick={onClose} ref={cancelRef}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function ConfirmDeleteDialog({
  postId,
  isOpen,
  onClose,
}: {
  postId: number
  isOpen: boolean
  onClose: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const deletePostMutation = reactClient.post.delete.useMutation({
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })

  return (
    <Dialog isOpen={isOpen} onClose={onClose} initialFocus={cancelRef}>
      <DialogContent>
        <DialogTitle>Delete post</DialogTitle>
        <DialogDescription className="mt-6">
          Are you sure you want to delete this post?
        </DialogDescription>
        <DialogCloseButton onClick={onClose} />
      </DialogContent>
      <DialogActions>
        <Button
          variant="secondary"
          className="!text-red"
          isLoading={deletePostMutation.isLoading}
          loadingChildren="Deleting post"
          onClick={() => {
            deletePostMutation.mutate(postId, {
              onSuccess: () => router.push('/'),
            })
          }}
        >
          Delete post
        </Button>
        <Button variant="secondary" onClick={onClose} ref={cancelRef}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function ConfirmHideDialog({
  postId,
  isOpen,
  onClose,
}: {
  postId: number
  isOpen: boolean
  onClose: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const utils = reactClient.useUtils()
  const hidePostMutation = reactClient.post.hide.useMutation({
    onSuccess: () => {
      return utils.post.detail.invalidate({id: postId})
    },
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })

  return (
    <Dialog isOpen={isOpen} onClose={onClose} initialFocus={cancelRef}>
      <DialogContent>
        <DialogTitle>Hide post</DialogTitle>
        <DialogDescription className="mt-6">
          Are you sure you want to hide this post?
        </DialogDescription>
        <DialogCloseButton onClick={onClose} />
      </DialogContent>
      <DialogActions>
        <Button
          variant="secondary"
          isLoading={hidePostMutation.isLoading}
          loadingChildren="Hiding post"
          onClick={() => {
            hidePostMutation.mutate(postId, {
              onSuccess: () => {
                toast.success('Post hidden')
                onClose()
              },
            })
          }}
        >
          Hide post
        </Button>
        <Button variant="secondary" onClick={onClose} ref={cancelRef}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function ConfirmUnhideDialog({
  postId,
  isOpen,
  onClose,
}: {
  postId: number
  isOpen: boolean
  onClose: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const utils = reactClient.useUtils()
  const unhidePostMutation = reactClient.post.unhide.useMutation({
    onSuccess: () => {
      return utils.post.detail.invalidate({id: postId})
    },
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })

  return (
    <Dialog isOpen={isOpen} onClose={onClose} initialFocus={cancelRef}>
      <DialogContent>
        <DialogTitle>Unhide post</DialogTitle>
        <DialogDescription className="mt-6">
          Are you sure you want to unhide this post?
        </DialogDescription>
        <DialogCloseButton onClick={onClose} />
      </DialogContent>
      <DialogActions>
        <Button
          variant="secondary"
          isLoading={unhidePostMutation.isLoading}
          loadingChildren="Unhiding post"
          onClick={() => {
            unhidePostMutation.mutate(postId, {
              onSuccess: () => {
                toast.success('Post unhidden')
                onClose()
              },
            })
          }}
        >
          Unhide post
        </Button>
        <Button variant="secondary" onClick={onClose} ref={cancelRef}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

