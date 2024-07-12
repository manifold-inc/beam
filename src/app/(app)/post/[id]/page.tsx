import { validateRequest } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PostPage } from "./ClientPage"
import { createCaller } from '@/server/routers/_app'
import { db } from '@/lib/db'

export const revalidate = 0
export default async function Page({params}: {params: {id: string}}){
  const {user, session} = await validateRequest()
  if(!user) redirect('/sign-in')

  const caller = createCaller({
    db,
    user,
    session,
  })

  const post = await caller.post.detail({id: Number(params.id)})
  return <PostPage initialData={post} id={params.id} user={user}/>
}
