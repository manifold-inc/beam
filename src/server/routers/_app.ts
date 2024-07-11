import { createTRPCRouter } from '../context'
import { commentRouter } from './comment'
import { postRouter } from './post'
import { userRouter } from './user'

export const appRouter = createTRPCRouter({
  post: postRouter,
  comment: commentRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter
