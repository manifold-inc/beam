import { validateRequest } from "@/lib/auth"
import { redirect } from "next/navigation"
import { EditPage } from "./ClientPage"

export default async function Page({params}: {params: {id: string}}){
  const {user} = await validateRequest()
  if(!user) redirect('/sign-in')
  return <EditPage id={params.id} user={user}/>
}
