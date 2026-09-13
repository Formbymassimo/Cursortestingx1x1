# Fieldbook

A research workspace. A researcher can create an account, start a project, write a questionnaire, keep contact cards, email invite links, link a Google Form, and read answers.

This version does **not** include a GDPR / consent-centre panel. The public questionnaire still tells people that answers will be used for research.

## What you can do

1. Create a researcher account with email and password.
2. Create a project (name + optional description).
3. Create a questionnaire with ordered questions: short text, long text, single choice, multiple choice.
4. Keep a contact directory (name, email, phone, notes, tags).
5. When someone leaves a name or email on a response, Fieldbook upserts a contact card (matched on email when present) and links them to the project as **responded**.
6. Attach existing contacts to a project as **invited**, then email them the fill link from a questionnaire.
7. Copy a unique invite link. Participants do not sign in.
8. Optionally connect Google and link an existing Google Form to a project. Participants open the Form’s public URL.
9. Review Fieldbook responses, and optionally sync Google Form responses onto the project page.

## Requirements

- Node.js 20 or newer
- npm (comes with Node)

You do **not** need Postgres, Docker, Resend, or Google to try the core app on your computer. Local demo mode uses a SQLite file named `dev.db` in this project folder. Email and Google stay optional and fail with a clear message if the keys are missing.

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

That account already has a sample project, questionnaire, one response, and demo contacts (including Jordan Lee from the sample response). You can also register a new account from the site.

To reset the local demo database and seed it again:

```bash
npm run db:reset
```

## Walk through the product

1. Sign in as the demo researcher, or create your own account.
2. Open **Projects**, then open **Campus dining study** or create a project.
3. Open **Contacts**. Search, open a card, and add your own contact.
4. On a project, attach existing contacts (this marks them invited).
5. Create or open a questionnaire, copy the invite link, or email selected contacts / extra addresses.
6. Open that link in a private window and submit answers as a participant. If you leave a name or email, a contact card is created or updated.
7. Back in the researcher account, open **View responses** and the contact card.
8. Optional: in **Settings**, connect Google, then link a Form on the project page.

If email keys are not set, sending shows a clear error. The copy-link button still works. Fieldbook never pretends an email was sent.

## Environment variables

Copy `.env.example` to `.env` (the setup script does this for you).

| Name | Required | What it is |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Local demo: `file:./dev.db`. Production: a Postgres URL from Neon, Supabase, or Vercel Postgres. |
| `AUTH_SECRET` | Yes in production | A long random string used to sign login cookies. Change this before you deploy. |
| `NEXT_PUBLIC_APP_URL` | Optional | Public site URL used for invite links and the Google redirect, for example `https://your-app.vercel.app`. |
| `RESEND_API_KEY` | Only for email | API key from [Resend](https://resend.com). Leave blank locally if you do not want to send mail. |
| `EMAIL_FROM` | Only for email | From address Resend will accept, such as `Fieldbook <studies@your-domain.com>`. |
| `GOOGLE_CLIENT_ID` | Only for Google Forms | OAuth client ID from Google Cloud. |
| `GOOGLE_CLIENT_SECRET` | Only for Google Forms | OAuth client secret from Google Cloud. |

Create a production secret with:

```bash
openssl rand -base64 32
```

## Send invite emails with Resend

Email is optional. Without these variables, the send buttons explain what is missing.

1. Create a free account at [Resend](https://resend.com).
2. Add and verify a sending domain (Resend’s dashboard walks through DNS). For first tests, Resend also documents a limited test sender.
3. Create an API key.
4. In `.env` or Vercel environment variables, set:
   - `RESEND_API_KEY` = the key
   - `EMAIL_FROM` = an address on your verified domain, for example `Fieldbook <studies@your-domain.com>`
5. Restart the app. Open a questionnaire, select contacts or type emails, and send.

The email includes the project name, questionnaire title, the fill link, and a line that answers will be used for research.

## Connect Google Forms

Google is optional. Without these variables, Settings and the project page explain the setup instead of crashing.

1. Open [Google Cloud Console](https://console.cloud.google.com) and create a project (or pick one).
2. Enable **Google Forms API** and **Google Drive API**.
3. Go to **APIs & Services → OAuth consent screen**. Choose External (or Internal on a Workspace account). Add your email as a test user while the app is in testing.
4. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**. Application type: **Web application**.
5. Add an authorized redirect URI:
   - Local: `http://localhost:3000/api/google/callback`
   - Production: `https://your-app.vercel.app/api/google/callback`
6. Copy the client ID and secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
7. Set `NEXT_PUBLIC_APP_URL` to the same site you used in the redirect URI.
8. Restart the app, open **Settings**, and click **Connect Google**.
9. On a project, paste the Form **edit** URL (the one that contains `/edit`) or pick a form from the list. Participants are sent to the public fill link. That is more reliable than embedding.

A published `/forms/d/e/.../viewform` link is not enough for the API. Use the edit URL or the picker.

**Sync responses** pulls answers from Google into a table on the project page. It does not turn them into Fieldbook questionnaire rows.

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
   - Optional: `RESEND_API_KEY`, `EMAIL_FROM`
   - Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
5. If you use Google, add the Vercel `/api/google/callback` URL to the OAuth client.
6. Deploy. The build command generates the database client and applies the schema with `prisma db push`.
7. After the first deploy, either register a new researcher in the live app, or run the seed against production from your computer:

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

- `app/(app)` — signed-in researcher pages (projects, contacts, settings)
- `app/q/[token]` — public participant form
- `app/api/google` — Google OAuth start and callback
- `app/actions` — form submissions
- `prisma/schema.prisma` — data model
- `prisma/seed.ts` — demo researcher, sample study, and demo contacts

## Out of scope for this version

- GDPR / consent-centre workflows beyond the public-form research blurb
- Design-system kits beyond a clean, accessible layout
