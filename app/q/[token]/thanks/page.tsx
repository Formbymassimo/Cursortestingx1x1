import Link from "next/link";
import { Card } from "@/components/ui";
import { getPublicQuestionnaire } from "@/lib/services/questionnaires";

export default async function ThanksPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const questionnaire = await getPublicQuestionnaire(token);
  if (!questionnaire) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <Card>
          <h1 className="text-3xl">Invite link not found</h1>
          <p className="mt-3 text-muted">
            This questionnaire link is invalid or no longer available.
          </p>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-full">
      <main className="mx-auto max-w-xl px-4 py-16">
        <Card>
          <h1 className="text-3xl">Thank you</h1>
          <p className="mt-3 leading-7 text-muted">
            Your answers for <strong>{questionnaire.title}</strong> were submitted.
            You can close this page.
          </p>
          <p className="mt-4 text-sm text-muted">
            If you reached this page by mistake, you can{" "}
            <Link href={`/q/${token}`} className="text-accent underline">
              open the questionnaire again
            </Link>
            .
          </p>
        </Card>
      </main>
    </div>
  );
}
