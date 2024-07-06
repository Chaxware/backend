# Run

To run your own backend and database using turso, go to their
[website](https://turso.tech), and create an account. You may create your
backend during the signup process (name the database `chax` or something).
Then follow the instructions at the [quickstart page](https://docs.turso.tech/quickstart)
(upto 2nd step if you have already made a database). Also follow the first step
in the [TypeScript section](https://docs.turso.tech/sdk/ts/quickstart).

After you have setup the database, clone the repo and install the dependencies:

```bash
cd clone https://github.com/Chaxware/backend.git
cd backend
npm install
npx drizzle-kit push
```

After that, rename the `wranger.example.toml` to `wrangler.toml`, while
replacing the `DATABASE_URL` and `DATABASE_TOKEN` values with the ones that you
created (We hope that you have done this to the `.env` file already).

Then run these commands _(optional)_ to bootstrap the database with dummy
hubs, channels and messages:

```bash
npm run bootstrap
```

Now, you can finally run the server

```bash
npm run dev
```

## Deploy

```bash
npm run deploy
```
