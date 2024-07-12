import {
  mysqlTable,
  index,
  primaryKey,
  varchar,
  int,
  text,
  datetime,
  mysqlEnum,
  boolean,
  timestamp,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz");
export const genId = {
  user: () => "u_" + nanoid(30),
  session: () => "s_" + nanoid(30),
  file: () => "f_" + nanoid(30),
};


export const Account = mysqlTable(
  'Account',
  {
    id: varchar('id', { length: 191 }).notNull(),
    userId: varchar('userId', { length: 191 }).notNull(),
    type: varchar('type', { length: 191 }).notNull(),
    provider: varchar('provider', { length: 191 }).notNull(),
    providerAccountId: varchar('providerAccountId', { length: 191 }).notNull(),
    refresh_token: varchar('refresh_token', { length: 2000 }),
    refresh_token_expires_in: int('refresh_token_expires_in'),
    access_token: varchar('access_token', { length: 2000 }),
    expires_at: int('expires_at'),
    token_type: varchar('token_type', { length: 191 }),
    scope: varchar('scope', { length: 191 }),
    id_token: varchar('id_token', { length: 2000 }),
    session_state: varchar('session_state', { length: 2000 }),
    oauth_token_secret: varchar('oauth_token_secret', { length: 2000 }),
    oauth_token: varchar('oauth_token', { length: 2000 }),
  },
  (table) => {
    return {
      provider_providerAccountId_key: index(
        'Account_provider_providerAccountId_key'
      ).on(table.provider, table.providerAccountId),
      userId_idx: index('Account_userId_idx').on(table.userId),
      Account_id: primaryKey({ columns: [table.id], name: 'Account_id' }),
    }
  }
)


export const Comment = mysqlTable(
  'Comment',
  {
    id: int('id').autoincrement().notNull(),
    content: text('content').notNull(),
    contentHtml: text('contentHtml').notNull(),
    createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
      .default(sql`(CURRENT_TIMESTAMP(3))`)
      .notNull(),
    postId: int('postId').notNull(),
    authorId: varchar('authorId', { length: 191 }).notNull(),
  },
  (table) => {
    return {
      authorId_idx: index('Comment_authorId_idx').on(table.authorId),
      postId_idx: index('Comment_postId_idx').on(table.postId),
      Comment_id: primaryKey({ columns: [table.id], name: 'Comment_id' }),
    }
  }
)

export const LikedPosts = mysqlTable(
  'LikedPosts',
  {
    postId: int('postId').notNull(),
    userId: varchar('userId', { length: 191 }).notNull(),
    createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
      .default(sql`(CURRENT_TIMESTAMP(3))`)
      .notNull(),
  },
  (table) => {
    return {
      userId_idx: index('LikedPosts_userId_idx').on(table.userId),
      LikedPosts_postId_userId: primaryKey({
        columns: [table.postId, table.userId],
        name: 'LikedPosts_postId_userId',
      }),
    }
  }
)

export const Post = mysqlTable(
  'Post',
  {
    id: int('id').autoincrement().notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    contentHtml: text('contentHtml').notNull(),
    hidden: boolean('hidden').default(false).notNull(),
    createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
      .default(sql`(CURRENT_TIMESTAMP(3))`)
      .notNull(),
    updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 })
      .default(sql`(CURRENT_TIMESTAMP(3))`)
      .notNull(),
    authorId: varchar('authorId', { length: 191 }).notNull(),
  },
  (table) => {
    return {
      authorId_idx: index('Post_authorId_idx').on(table.authorId),
      hidden_createdAt_idx: index('Post_hidden_createdAt_idx').on(
        table.hidden,
        table.createdAt
      ),
      /* Manually apply this
      title_content_idx: index('Post_title_content_idx').on(
        table.title,
        table.content,
      ),

      CREATE INDEX Post_title_content_idx ON Post (title, content(512));
      */
      Post_id: primaryKey({ columns: [table.id], name: 'Post_id' }),
    }
  }
)

export const Session = mysqlTable("session", {
  id: varchar("id", {
    length: 255,
  })
    .unique()
    .notNull(),
  userId: varchar("user_id", {
    length: 32,
  })
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  expiresAt: datetime("expires_at").notNull(),
  createdAt: datetime("createdAt", { mode: "date" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});


export const User = mysqlTable(
  'User',
  {
    id: varchar('id', { length: 191 }).notNull(),
    name: varchar('name', { length: 191 }),
    email: varchar('email', { length: 191 }).notNull(),
    emailVerified: timestamp('emailVerified', { mode: 'date'}),
    github_id: varchar("github_id", { length: 255 }).unique(),
    image: varchar('image', { length: 191 }),
    title: varchar('title', { length: 191 }),
    role: mysqlEnum('role', ['USER', 'ADMIN']).default('USER').notNull(),
    createdAt: datetime("createdAt", { mode: "date" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => {
    return {
      email_key: index('User_email_key').on(table.email),
      User_id: primaryKey({ columns: [table.id], name: 'User_id' }),
    }
  }
)

export const VerificationToken = mysqlTable(
  'VerificationToken',
  {
    identifier: varchar('identifier', { length: 191 }).notNull().primaryKey(),
    token: varchar('token', { length: 191 }).notNull(),
    expires: timestamp('expires', { mode: 'date', fsp: 3 }).notNull(),
  },
  (table) => {
    return {
      identifier_token_key: index('VerificationToken_identifier_token_key').on(
        table.identifier,
        table.token
      ),
      token_key: index('VerificationToken_token_key').on(table.token),
    }
  }
)

