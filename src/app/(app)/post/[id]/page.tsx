import { validateRequest } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PostPage } from "./ClientPage"
import { serverClient } from "trpc/server"

export const revalidate = 0
export default async function Page({params}: {params: {id: string}}){
  const {user} = await validateRequest()
  if(!user) redirect('/sign-in')

  const post = await serverClient.post.detail.query({id: Number(params.id)})
  return <PostPage initialData={post} id={params.id} user={user}/>
}
