# chax-backend

### Getting it up and running
1. Look at env.mjs to understand the env schema
2. Make .env
3. `pnpm i` and ̀`pnpm dev`

### DB Migration
1. `npx drizzle-kit generate` - to generate the SQL migration and put it in ./migrations
2. ̀`npx drizzle-kit migrate` - to push it to the database
for additional details visit drizzle docs.
