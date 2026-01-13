import 'dotenv/config';  // Loads .env variables
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Optional: seed script if you have one
    // seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),  // This is where your Postgres URL goes
  },
});