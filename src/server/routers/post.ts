import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'
import { TRPCError } from '@trpc/server'
import { and, asc, count, desc, eq, like, or, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/mysql-core'
import { z } from 'zod'
import { createTRPCRouter, procedure } from '../context'
import { Comment, LikedPosts, Post, User } from '../schema'
import { markdownToHtml } from '../utils'

export const postRouter = createTRPCRouter({
  feed: procedure
    .input(
      z
        .object({
          take: z.number().min(1).max(50).optional(),
          skip: z.number().min(1).optional(),
          authorId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      let where = and(eq(Post.hidden, false))
      if (input?.authorId)
        where = and(
          eq(Post.hidden, false),
          eq(Post.authorId, input?.authorId ?? '')
        )
      if (ctx.user.role === 'ADMIN')
        where = eq(Post.authorId, input?.authorId ?? '')

      const likedby = alias(User, 'likedby')
      const posts = await ctx.db
        .select({
          id: Post.id,
          title: Post.title,
          contentHtml: Post.contentHtml,
          createdAt: Post.createdAt,
          hidden: Post.hidden,
          author: {
            id: User.id,
            name: User.name,
            image: User.image,
          },
          likedBy: sql<
            { id: string; name: string }[]
          >`JSON_ARRAYAGG(JSON_OBJECT('id', ${likedby.id}, 'name',${likedby.name}))`,
          comments: count(Comment.id),
        })
        .from(Post)
        .where(where)
        .innerJoin(User, eq(Post.authorId, User.id))
        .leftJoin(LikedPosts, eq(LikedPosts.postId, Post.id))
        .leftJoin(likedby, eq(LikedPosts.userId, likedby.id))
        .leftJoin(Comment, eq(Post.id, Comment.postId))
        .orderBy(desc(Post.createdAt))
        .groupBy(Post.id)
        .limit(input?.take ?? 20)
        .offset(input?.skip ?? 0)
      const [{ count: postCount }] = await ctx.db
        .select({ count: count() })
        .from(Post)
      return {
        posts,
        postCount,
      }
    }),
  detail: procedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [post] = await ctx.db
        .select({
          id: Post.id,
          title: Post.title,
          content: Post.content,
          contentHtml: Post.contentHtml,
          createdAt: Post.createdAt,
          hidden: Post.hidden,
          author: {
            id: User.id,
            name: User.name,
            image: User.image,
          },
        })
        .from(Post)
        .where(eq(Post.id, input.id))
        .innerJoin(User, eq(Post.authorId, User.id))
        .orderBy(desc(Post.createdAt))
      const comments = await ctx.db
        .select({
          id: Comment.id,
          content: Comment.content,
          contentHtml: Comment.contentHtml,
          createdAt: Comment.createdAt,
          author: {
            id: User.id,
            name: User.name,
            image: User.image,
          },
        })
        .from(Comment)
        .innerJoin(User, eq(User.id, Comment.authorId))
        .where(eq(Comment.postId, input.id))
        .orderBy(asc(Comment.createdAt))
      const likes = await ctx.db
        .select({
          id: User.id,
          name: User.name,
        })
        .from(LikedPosts)
        .innerJoin(User, eq(User.id, LikedPosts.userId))
        .where(eq(LikedPosts.postId, input.id))
        .orderBy(asc(LikedPosts.createdAt))

      const postBelongsToUser = post?.author.id === ctx.user.id

      if (
        !post ||
        (post.hidden && !postBelongsToUser && ctx.user.role !== 'ADMIN')
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No post with id '${input.id}'`,
        })
      }

      return { post, likes, comments }
    }),
  search: procedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db
        .select({ id: Post.id, title: Post.title })
        .from(Post)
        .where(
          and(
            eq(Post.hidden, false),
            or(
              like(Post.title, '%' + input.query + '%'),
              like(Post.content, '%' + input.query + '%')
            )
          )
        )
        .limit(10)
      return posts
    }),
  add: procedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.insert(Post).values({
        title: input.title,
        content: input.content,
        contentHtml: DOMPurify.sanitize(
          marked.parse(input.content, { breaks: true }) as string
        ),
        authorId: ctx.user.id,
      })

      // Redo this with discord later, maybe.
      // await postToSlackIfEnabled({ post, authorName: ctx.user.name })

      return post.insertId
    }),
  edit: procedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          title: z.string().min(1),
          content: z.string().min(1),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input

      const [post] = await ctx.db
        .select({ authorId: Post.authorId })
        .from(Post)
        .where(eq(Post.id, id))

      const postBelongsToUser = post?.authorId === ctx.user.id

      if (!postBelongsToUser) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      await ctx.db
        .update(Post)
        .set({
          title: data.title,
          content: data.content,
          contentHtml: markdownToHtml(data.content),
        })
        .where(eq(Post.id, id))

      return await ctx.db.select().from(Post).where(eq(Post.id, id))
    }),
  delete: procedure.input(z.number()).mutation(async ({ ctx, input: id }) => {
    const [post] = await ctx.db
      .select({ authorId: Post.authorId })
      .from(Post)
      .where(eq(Post.id, id))

    const postBelongsToUser = post?.authorId === ctx.user.id

    if (!postBelongsToUser) {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }

    await ctx.db.delete(Post).where(eq(Post.id, id))
    return id
  }),
  like: procedure.input(z.number()).mutation(async ({ ctx, input: id }) => {
    await ctx.db.insert(LikedPosts).values({
      postId: id,
      userId: ctx.user.id,
    })
    return id
  }),
  unlike: procedure.input(z.number()).mutation(async ({ ctx, input: id }) => {
    await ctx.db
      .delete(LikedPosts)
      .where(and(eq(LikedPosts.userId, ctx.user.id), eq(LikedPosts.postId, id)))

    return id
  }),
  hide: procedure.input(z.number()).mutation(async ({ ctx, input: id }) => {
    if (ctx.user.role !== 'ADMIN') {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }

    await ctx.db.update(Post).set({ hidden: true }).where(eq(Post.id, id))
    return id
  }),
  unhide: procedure.input(z.number()).mutation(async ({ ctx, input: id }) => {
    if (ctx.user.role !== 'ADMIN') {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }

    await ctx.db.update(Post).set({ hidden: false }).where(eq(Post.id, id))
    return id
  }),
})
