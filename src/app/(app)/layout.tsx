import { Layout } from '@/components/layout'
import { validateRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import { TRPCReactProvider } from 'trpc/react'
import { PropsWithChildren, Suspense } from 'react'
import { Provider } from '@radix-ui/react-tooltip'

export const revalidate = 0
export default async function AppLayout({ children }: PropsWithChildren) {
  const user = await validateRequest()
  if (!user.user) redirect('/sign-in')
  return (
    <TRPCReactProvider>
      <Provider>
        <Layout user={user.user}>
          <Suspense fallback={<></>}>{children}</Suspense>
        </Layout>
        <Toaster richColors />
      </Provider>
    </TRPCReactProvider>
  )
}
