import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { buttonClass, Card } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <div className="min-h-full">
      <AppHeader user={user} />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-accent">
          Week-1 research tool
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl leading-tight text-stone-950 sm:text-5xl">
          Create a questionnaire, share a link, and see the answers.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-7 text-muted">
          Fieldbook is a small researcher workspace. Sign in, start a project,
          write questions, copy an invite link, and review responses. No email
          sending and no extra CRM features in this first version.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {user ? (
            <Link href="/projects" className={buttonClass("primary")}>
              Go to projects
            </Link>
          ) : (
            <>
              <Link href="/register" className={buttonClass("primary")}>
                Create a researcher account
              </Link>
              <Link href="/login" className={buttonClass("secondary")}>
                Sign in
              </Link>
            </>
          )}
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <Card>
            <h2 className="text-lg">1. Create</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Add a project, then write short text, long text, single-choice, or
              multiple-choice questions.
            </p>
          </Card>
          <Card>
            <h2 className="text-lg">2. Share</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Copy a unique invite link. Participants do not need an account.
            </p>
          </Card>
          <Card>
            <h2 className="text-lg">3. Review</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Open the response table. Optional name and email are stored on each
              response for later follow-up.
            </p>
          </Card>
        </div>

        <Card className="mt-8">
          <h2 className="text-lg">Try the local demo</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            After <code className="rounded bg-stone-100 px-1.5 py-0.5">npm run setup</code>,
            sign in with <strong>researcher@fieldbook.test</strong> and password{" "}
            <strong>fieldbook-demo</strong>. That account includes a sample campus
            dining study and one response.
          </p>
        </Card>
      </main>
    </div>
  );
}
