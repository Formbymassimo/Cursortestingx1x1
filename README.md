# Fieldbook

A week-1 research tool. A researcher can create an account, start a project, write a questionnaire, copy an invite link, and read participant answers.

This first version does **not** include Google Forms, contact-card CRM, tagging, consent workflows beyond a public-form blurb, or sending invite emails. Copying the link is enough.

## What you can do

1. Create a researcher account with email and password.
2. Create a project (name + optional description).
3. Create a questionnaire with ordered questions: short text, long text, single choice, multiple choice.
4. Copy a unique invite link. Participants do not sign in.
5. Participants can optionally leave a name and email, then submit answers.
6. The researcher sees responses in a table, plus project-level response counts.

## Requirements

- Node.js 20 or newer
- npm (comes with Node)

You do **not** need Postgres, Docker, or a cloud account to try this on your computer. Local demo mode uses a SQLite file.

## Run it on your computer (demo mode)

In a terminal, from this folder:

```bash
npm install
npm run setup
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

`npm run setup` creates a local `.env` file (if you do not already have one), creates the database file, and loads a demo researcher account:

- Email: `researcher@fieldbook.test`
- Password: `fieldbook-demo`

That account already has a sample project, questionnaire, and one response. You can also register a new account from the site.

To reset the local demo database and seed it again:

```bash
npm run db:reset
```

## Walk through the product

1. Sign in as the demo researcher, or create your own account.
2. Open **Projects**, then create a project (or open **Campus dining study**).
3. Create a questionnaire and add a few questions.
4. On the questionnaire page, copy the invite link.
5. Open that link in a private window (or another browser) and submit answers as a participant. The form tells people that answers will be used for research.
6. Back in the researcher account, open **View responses**.

Email sending is intentionally not wired up. If you want to invite people, paste the link into your own email.

## Environment variables

Copy `.env.example` to `.env` (the setup script does this for you).

| Name | Required | What it is |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Local demo: `file:./dev.db`. Production: a Postgres URL from Neon, Supabase, or Vercel Postgres. |
| `AUTH_SECRET` | Yes in production | A long random string used to sign login cookies. Change this before you deploy. |
| `NEXT_PUBLIC_APP_URL` | Optional | Public site URL used when building invite links, for example `https://your-app.vercel.app`. If you leave it blank, Fieldbook uses the current request host. |

Create a production secret with:

```bash
openssl rand -base64 32
```

## Real Postgres (optional locally, required to deploy)

SQLite is only for trying the app on your machine. Hosted Next.js (including Vercel) cannot keep a SQLite file, so production needs Postgres.

The app picks the database type from `DATABASE_URL`:

- Starts with `file:` → SQLite
- Starts with `postgres` → Postgres

You do not have to edit the Prisma schema by hand.

### Free hosted Postgres (no Docker)

Any of these work. Neon is usually the fastest:

1. Create a free project at [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/storage/postgres).
2. Copy the connection string. It should start with `postgresql://` or `postgres://`.
3. Put it in `.env` as `DATABASE_URL`.
4. Run:

```bash
npm run db:push
npm run db:seed
npm run dev
```

If the host asks for SSL, most Prisma-friendly URLs already include it. If a connection fails, add `?sslmode=require` to the end of the URL.

### Local Postgres with Docker

If you already use Docker:

```bash
docker compose up -d
```

Then set this in `.env`:

```bash
DATABASE_URL="postgresql://fieldbook:fieldbook@localhost:5432/fieldbook"
```

and run `npm run db:push` and `npm run db:seed`.

## Deploy on Vercel

1. Push this repository to GitHub.
2. Import the repo in [Vercel](https://vercel.com). The Next.js defaults are enough.
3. Create a Postgres database (Neon’s Vercel integration is the common path).
4. In the Vercel project, add environment variables:
   - `DATABASE_URL` = the Postgres URL
   - `AUTH_SECRET` = the random string you generated
   - `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app` (or your custom domain)
5. Deploy. The build command generates the database client and applies the schema with `prisma db push`.
6. After the first deploy, either register a new researcher in the live app, or run the seed against production from your computer:

```bash
DATABASE_URL="your-production-postgres-url" npm run db:seed
```

Do not use the SQLite `file:./dev.db` value on Vercel.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run setup` | First-time local setup (env file, database, seed) |
| `npm run dev` | Start the local site |
| `npm run build` | Production build |
| `npm run db:push` | Apply the current schema to the database |
| `npm run db:seed` | Add or refresh the demo researcher |
| `npm run db:reset` | Wipe the local database and seed again |
| `npm run lint` | Run the linter |

## Project layout

- `app/(app)` — signed-in researcher pages
- `app/q/[token]` — public participant form
- `app/actions` — form submissions
- `prisma/schema.prisma` — data model
- `prisma/seed.ts` — demo researcher and sample study

## Out of scope for this version

- Google Forms import or sync
- Contact cards, tags, or follow-up workflows
- Sending invite or magic-link emails
- Design-system kits beyond a clean, accessible layout
