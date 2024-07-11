import { cookies } from 'next/headers'
import { OAuth2RequestError } from 'arctic'
import { eq } from 'drizzle-orm'
import { github, lucia } from '@/lib/auth'
import { db } from '@/lib/db'
import { User, genId } from '@/server/schema'
import { serverEnv } from '@/env/server'

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const storedState = cookies().get('github_oauth_state')?.value ?? null
  if (!code || !state || !storedState || state !== storedState) {
    console.log({code, state, storedState})
    return new Response(null, {
      status: 400,
    })
  }

  try {
    const tokens = await github.validateAuthorizationCode(code)
    const githubUserResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    })
    const githubUser = (await githubUserResponse.json()) as GitHubUser

    const [existing] = await db
      .select()
      .from(User)
      .where(eq(User.github_id, githubUser.id))
    const userId = existing?.id ?? genId.user()

    if (existing) {
      const session = await lucia.createSession(existing.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      )
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/',
        },
      })
    }

    const emails = (await (
      await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `token ${tokens.accessToken}`,
        },
      })
    ).json()) as { email: string; primary: boolean }[]
    const primaryEmail =
      emails.find((email) => email.primary)?.email ?? emails[0].email

    // New user account
    const userOrgs = await (
      await fetch('https://api.github.com/user/orgs', {
        headers: { Authorization: `token ${tokens.accessToken}` },
      })
    ).json() as {login: string}[]

    console.log(userOrgs)
    // Not in org
    if (
      !userOrgs.find(
        (org) => org.login === serverEnv.GITHUB_ALLOWED_ORG
      )
    ) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/sign-in',
        },
      })
    }

    await db.insert(User).values({
      id: userId,
      github_id: githubUser.id,
      name: githubUser.login,
      email: primaryEmail,
    })

    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
      },
    })
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      })
    }
    console.error(e)
    return new Response(null, {
      status: 500,
    })
  }
}

interface GitHubUser {
  id: string
  login: string
}
