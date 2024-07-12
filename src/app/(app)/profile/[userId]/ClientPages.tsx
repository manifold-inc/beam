'use client'
import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import {
  Dialog,
  DialogActions,
  DialogCloseButton,
  DialogContent,
  DialogTitle,
} from '@/components/dialog'
import { IconButton } from '@/components/icon-button'
import { EditIcon } from '@/components/icons'
import { TextField } from '@/components/text-field'
import { UploadButton } from '@/server/uploadthing'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { reactClient } from 'trpc/react'
import { RouterOutputs } from 'trpc/shared'

export function ProfileInfo({
  user,
  isSelf,
}: {
  user: RouterOutputs['user']['profile']
  isSelf: boolean
}) {
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false)
  const [isUpdateAvatarDialogOpen, setIsUpdateAvatarDialogOpen] =
    useState(false)

  return (
    <>
      <Head>
        <title>{user.name} - Meam</title>
      </Head>

      <div className="relative flex items-center gap-4 py-8 overflow-hidden">
        <div className="flex items-center gap-8">
          {isSelf ? (
            <button
              type="button"
              className="relative inline-flex group"
              onClick={() => {
                setIsUpdateAvatarDialogOpen(true)
              }}
            >
              <Avatar name={user.name!} src={user.image} size="lg" />
              <div className="absolute inset-0 transition-opacity bg-gray-900 rounded-full opacity-0 group-hover:opacity-50" />
              <div className="absolute inline-flex items-center justify-center transition-opacity -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-white rounded-full opacity-0 top-1/2 left-1/2 h-9 w-9 group-hover:opacity-100">
                <EditIcon className="w-4 h-4 text-white" />
              </div>
            </button>
          ) : (
            <Avatar name={user.name!} src={user.image} size="lg" />
          )}

          <div className="flex-1">
            <h1 className="bg-primary text-2xl font-semibold tracking-tight md:text-3xl">
              {user.name}
            </h1>
            {user.title && (
              <p className="text-lg tracking-tight text-secondary">
                {user.title}
              </p>
            )}
          </div>
        </div>

        {isSelf && (
          <div className="ml-auto mr-10">
            <IconButton
              variant="secondary"
              onClick={() => {
                setIsEditProfileDialogOpen(true)
              }}
            >
              <EditIcon className="w-4 h-4" />
            </IconButton>
          </div>
        )}

        <DotPattern />
      </div>

      <EditProfileDialog
        user={{
          name: user.name!,
          title: user.title,
        }}
        isOpen={isEditProfileDialogOpen}
        onClose={() => {
          setIsEditProfileDialogOpen(false)
        }}
      />

      <UpdateAvatarDialog
        key={user.image}
        user={{
          name: user.name!,
          image: user.image,
        }}
        isOpen={isUpdateAvatarDialogOpen}
        onClose={() => {
          setIsUpdateAvatarDialogOpen(false)
        }}
      />
    </>
  )
}

function DotPattern() {
  return (
    <svg
      className="absolute inset-0 -z-1"
      width={720}
      height={240}
      fill="none"
      viewBox="0 0 720 240"
    >
      <defs>
        <pattern
          id="dot-pattern"
          x={0}
          y={0}
          width={31.5}
          height={31.5}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={1.5}
            cy={1.5}
            r={1.5}
            className="text-gray-100 dark:text-gray-700"
            fill="currentColor"
          />
        </pattern>
      </defs>
      <rect width={720} height={240} fill="url(#dot-pattern)" />
    </svg>
  )
}

interface EditFormData {
  name: string
  title: string | null
}

function EditProfileDialog({
  user,
  isOpen,
  onClose,
}: {
  user: {
    name: string
    title: string | null
  }
  isOpen: boolean
  onClose: () => void
}) {
  const { register, handleSubmit, reset } = useForm<EditFormData>({
    defaultValues: {
      name: user.name,
      title: user.title,
    },
  })
  const utils = reactClient.useUtils()
  const editUserMutation = reactClient.user.edit.useMutation({
    onSuccess: () => {
      window.location.reload()
      return utils.post.feed.invalidate()
    },
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`)
    },
  })

  function handleClose() {
    onClose()
    reset()
  }

  const onSubmit: SubmitHandler<EditFormData> = (data) => {
    editUserMutation.mutate(
      {
        name: data.name,
        title: data.title,
      },
      {
        onSuccess: () => onClose(),
      }
    )
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <DialogTitle>Edit profile</DialogTitle>
          <div className="mt-6 space-y-6">
            <TextField
              {...register('name', { required: true })}
              label="Name"
              required
            />

            <TextField {...register('title')} label="Title" />
          </div>
          <DialogCloseButton onClick={handleClose} />
        </DialogContent>
        <DialogActions>
          <Button
            type="submit"
            isLoading={editUserMutation.isLoading}
            loadingChildren="Saving"
          >
            Save
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

function UpdateAvatarDialog({
  user,
  isOpen,
  onClose,
}: {
  user: {
    name: string
    image: string | null
  }
  isOpen: boolean
  onClose: () => void
}) {
  const [uploadedImage, setUploadedImage] = useState(user.image)
  const router = useRouter()

  function handleClose() {
    onClose()
    setUploadedImage(user.image)
  }
  const removeAvatar = reactClient.user.removeAvatar.useMutation({
    onSuccess: () => {
      router.refresh()
      handleClose()
    },
  })

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <DialogContent>
        <DialogTitle>Update avatar</DialogTitle>
        <DialogCloseButton onClick={handleClose} />
        <div className="flex justify-center mt-8">
          <Avatar name={user.name} src={uploadedImage} size="lg" />
        </div>
        <div className="grid grid-flow-col gap-6 mt-6">
          <div className="text-center">
            <UploadButton
              onClientUploadComplete={() => {
                handleClose()
                window.location.reload()
              }}
              onUploadError={(e) =>
                void toast.error(`Error uploading image: ${e.message}`)
              }
              endpoint="userAvatar"
            />
            <p className="mt-2 text-xs text-secondary">4MB max</p>
          </div>
          {/* TODO make this better*/}
          {uploadedImage && (
            <div className="text-center">
              <Button
                variant="secondary"
                className="!text-red"
                onClick={() => {
                  URL.revokeObjectURL(uploadedImage)
                  setUploadedImage(null)
                }}
              >
                Remove photo
              </Button>
              <p className="mt-2 text-xs text-secondary">
                And use default avatar
              </p>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        {user.image && !uploadedImage && (
          <Button
            disabled={removeAvatar.isLoading}
            variant="primary"
            onClick={() => {
              removeAvatar.mutate()
            }}
          >
            Save
          </Button>
        )}
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
