import { TRPCError } from '@trpc/server'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { createTRPCRouter, procedure } from '../context'
import { User } from '../schema'

export const userRouter = createTRPCRouter({
  profile: procedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input
      const user = await ctx.db.query.User.findFirst({
        where: (u, { eq }) => eq(u.id, id),
        columns: {
          id: true,
          name: true,
          image: true,
          title: true,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No profile with id '${id}'`,
        })
      }

      return user
    }),
  edit: procedure
    .input(
      z.object({
        name: z.string().min(1),
        title: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(User)
        .set({ name: input.name, title: input.title })
        .where(eq(User.id, ctx.user.id))
      return await ctx.db.select().from(User).where(eq(User.id, ctx.user.id))
    }),
  mentionList: procedure.query(async ({ ctx }) => {
    const users = await ctx.db.query.User.findMany({
      columns: {
        id: true,
        name: true,
      },
      orderBy: [asc(User.name)],
    })

    return users
  }),
})
