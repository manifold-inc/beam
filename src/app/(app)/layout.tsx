import { Layout } from '@/components/layout'
import { validateRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import { TRPCReactProvider } from 'trpc/react'
import { PropsWithChildren } from 'react'

export default async function AppLayout({ children }: PropsWithChildren) {
  const user = await validateRequest()
  if (!user.user) redirect('/sign-in')
  return (
    <TRPCReactProvider>
      <Layout user={user.user}>{children}</Layout>
      <Toaster richColors />
    </TRPCReactProvider>
  )
}
