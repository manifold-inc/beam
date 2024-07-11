import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createTRPCRouter, procedure } from '../context'
import { Comment } from '../schema'
import { markdownToHtml } from '../utils'

export const commentRouter = createTRPCRouter({
  add: procedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { insertId } = await ctx.db.insert(Comment).values({
        content: input.content,
        contentHtml: markdownToHtml(input.content),
        authorId: ctx.user.id,
        postId: input.postId,
      })

      return await ctx.db
        .select()
        .from(Comment)
        .where(eq(Comment.id, insertId as unknown as number))
    }),
  edit: procedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          content: z.string().min(1),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input
      const [comment] = await ctx.db
        .select({ authorId: Comment.authorId })
        .from(Comment)
        .where(eq(Comment.id, id))
      const commentBelongsToUser = comment?.authorId === ctx.user.id
      if (!commentBelongsToUser) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      await ctx.db
        .update(Comment)
        .set({
          content: data.content,
          contentHtml: markdownToHtml(data.content),
        })
        .where(eq(Comment.id, id))
      return await ctx.db.select().from(Comment).where(eq(Comment.id, id))
    }),
  delete: procedure.input(z.number()).mutation(async ({ ctx, input: id }) => {
    const [comment] = await ctx.db
      .select({ authorId: Comment.authorId })
      .from(Comment)
      .where(eq(Comment.id, id))
    const commentBelongsToUser = comment?.authorId === ctx.user.id
    if (!commentBelongsToUser) {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }
    await ctx.db.delete(Comment).where(eq(Comment.id, id))
    return id
  }),
})
