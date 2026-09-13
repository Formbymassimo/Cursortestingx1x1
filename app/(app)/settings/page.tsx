import Link from "next/link";
import { disconnectGoogleAction } from "@/app/actions/google";
import { buttonClass, Card, ErrorBanner } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import {
  getGoogleAccount,
  googleConfigured,
  googleSetupMessage,
} from "@/lib/services/google";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; connected?: string }>;
}) {
  const user = await requireUser();
  const { error, connected } = await searchParams;
  const account = await getGoogleAccount(user.id);
  const ready = googleConfigured();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl">Settings</h1>
      <p className="mt-2 text-muted">
        Connect Google if you want to link existing Google Forms to a project.
      </p>

      <Card className="mt-6 space-y-4">
        <h2 className="text-lg">Google Forms</h2>
        <ErrorBanner message={error} />
        {connected ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-stone-800">
            Google is connected.
          </p>
        ) : null}

        {!ready ? (
          <p className="text-sm leading-6 text-muted">{googleSetupMessage()}</p>
        ) : account ? (
          <>
            <p className="text-sm text-muted">
              Connected as {account.email || "your Google account"}.
            </p>
            <form action={disconnectGoogleAction}>
              <button type="submit" className={buttonClass("secondary")}>
                Disconnect Google
              </button>
            </form>
          </>
        ) : (
          <Link href="/api/google/start" className={buttonClass("primary")}>
            Connect Google
          </Link>
        )}
        <p className="text-sm leading-6 text-muted">
          After you connect, open a project and paste a Form edit URL or pick a
          form from your Drive list. Participants are sent to the public Google
          Form link — that is more reliable than embedding.
        </p>
      </Card>
    </div>
  );
}
