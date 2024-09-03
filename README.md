# chax-backend

## Run

Clone the repo and install the packages:

```bash
git clone https://github.com/Chaxware/backend.git
cd backend
bun install
```

Next, setup a database (either **local**, or in the **cloud**)

### Database (Local)

- Install the [Turso CLI](https://docs.turso.tech/cli/installation)
- Setup local libsql server, and migrate schema:

```bash
turso dev --db-file dev.db
bunx drizzle-kit migrate
```

### Database (Cloud)

To host your own database using turso, go to their [website](https://turso.tech),
and create an account. You may create your database during the signup process
(name the database `chax` or something).

Then follow the instructions at the [quickstart page](https://docs.turso.tech/quickstart)
(upto 2nd step if you have already made a database). Also follow the _first step_
in the [TypeScript section](https://docs.turso.tech/sdk/ts/quickstart).

Create a `.env` file in the root directory, and fill it with your URL and token:

```env
DATABASE_URL="<URL (starts with libsql://)>"
DATABASE_TOKEN="<database authentication token>"
```

> _Important_: You must set the `NODE_ENV` environment variable to `production`
> if you need to use the cloud database.

### Bootstrap _(optional)_

To fill a fresh database with sample data (hubs, channels and messages):

```bash
bun bootstrap
```

### Server

Now, you can finally run the server:

```bash
bun dev
```

> _Note_: Whenever you change the schema, run these commands:

1. `bunx drizzle-kit generate`: Generating SQL migration files from Drizzle ORM
2. `bunx drizzle-kit migrate`: Push schema changes to database

## Deploy

Fork this repo, and create a project in your vercel account by connecting the forked repo.
