import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { serverEnv } from "env/server";

config({ path: ".env" });

export default defineConfig({
  verbose: true,
  schema: "./src/server/schema.ts",
  dialect: 'mysql',
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
});
