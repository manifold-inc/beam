import { cache } from "react";
import { cookies } from "next/headers";
import { GitHub } from "arctic";
import { Lucia, type Session, type User } from "lucia";
import { adapter } from "./db";
import { serverEnv } from "@/env/server";

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
  interface DatabaseUserAttributes {
    github_id: string | null;
    role: "USER" | "ADMIN"
    image: string
    name: string
  }
}

export const lucia = new Lucia(adapter, {
  getUserAttributes: (a) => {
    return { github_id: a.github_id, role: a.role, image: a.image, name: a.name };
  },
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
    expires: false,
  },
});

export const github = new GitHub(
  serverEnv.GITHUB_ID,
  serverEnv.GITHUB_SECRET,
);

export const uncachedValidateRequest = async (): Promise<
  { user: User; session: Session } | { user: null; session: null }
> => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return { user: null, session: null };
  }
  const result = await lucia.validateSession(sessionId);
  // next.js throws when you attempt to set cookie when rendering page
  try {
    if (result.session?.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch {
    // Probably trying to set during page rendering, can safely swallow
    console.error("Failed to set session cookie");
  }
  return result;
};
export const validateRequest = cache(uncachedValidateRequest);
