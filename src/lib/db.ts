import { env } from 'process'
import { Client } from '@planetscale/database'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/planetscale-serverless'
import * as schema from 'server/schema'
import { DrizzleMySQLAdapter } from "@lucia-auth/adapter-drizzle";

config({ path: '../../.env' })
const connection = new Client({
  url: env.DATABASE_URL,
})

export const db = drizzle(connection, {schema})
export const adapter = new DrizzleMySQLAdapter(db, schema.Session, schema.User);
