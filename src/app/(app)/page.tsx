import { validateRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClientPage from './ClientPage'

export default async function Page() {
  const user = await validateRequest()
  if (!user.user) redirect('/sign-in')
  return <ClientPage user={user.user} />
}
