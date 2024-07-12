import { validateRequest } from '@/lib/auth'
import { initTRPC, TRPCError } from "@trpc/server";
import { db } from '@/lib/db'
import superjson from "superjson";
import { ZodError } from 'zod';

export const createContext = async () => {
  const {user, session} = await validateRequest()
  if(!user || !session) throw new TRPCError({code: "UNAUTHORIZED"})
  return {
    db,
    user,
    session,
  }
}

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory
export const procedure = t.procedure
