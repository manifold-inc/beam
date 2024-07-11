import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileFeed, ProfileInfo } from "./ClientPages";

export default async function ProfilePage({params}: {params: {userId: string}}){
  const {user} = await validateRequest()
  if(!user) redirect('/sign-in')
  return (
    <>
      <ProfileInfo user={user} profileUserId={params.userId}/>
      <ProfileFeed user={user} profileUserId={params.userId}/>
    </>
  )
}
