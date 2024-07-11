import { useCallback, useEffect } from 'react'
import { useBeforeunload } from 'react-beforeunload'
import { FormState, type FieldValues } from 'react-hook-form'

interface Props<T extends FieldValues> {
  formState: FormState<T>
  message?: string
}

const defaultMessage = 'Are you sure to leave without saving?'

export function useLeaveConfirm<T extends FieldValues>({
  formState,
  message = defaultMessage,
}: Props<T>) {
  const { isDirty } = formState

  const onRouteChangeStart = useCallback(() => {
    if (!isDirty) return
    if (window.confirm(message)) {
      return true
    }
    throw "Abort route change by user's confirmation."
  }, [isDirty, message])

  useEffect(() => {
    addEventListener('beforeunload', onRouteChangeStart)

    return () => {
      removeEventListener('beforeunload', onRouteChangeStart)
    }
  }, [onRouteChangeStart])

  useBeforeunload((event) => {
    if (!isDirty) return
    event.preventDefault()
  })

  return
}
