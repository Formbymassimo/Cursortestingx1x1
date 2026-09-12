import Link from "next/link";
import { PublicQuestionnaireForm } from "@/components/PublicQuestionnaireForm";
import { buttonClass, Card } from "@/components/ui";
import { getPublicQuestionnaire } from "@/lib/services/questionnaires";

export default async function PublicQuestionnairePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const questionnaire = await getPublicQuestionnaire(token);
  if (!questionnaire) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <Card>
          <h1 className="text-3xl">Invite link not found</h1>
          <p className="mt-3 text-muted">
            This questionnaire link is invalid or no longer available. Ask the
            researcher for a new invite link.
          </p>
          <Link href="/" className={`${buttonClass("primary")} mt-6`}>
            Back to Fieldbook
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-line bg-card">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <p className="text-sm text-muted">{questionnaire.project.name}</p>
          <h1 className="mt-1 text-3xl">{questionnaire.title}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="mb-6 text-sm leading-6 text-muted">
          This form is for a research study. You do not need an account. Required
          questions are marked with an asterisk. Pressing Enter will not submit
          the form — use the submit button when you are finished.
        </p>
        <PublicQuestionnaireForm
          token={token}
          questions={questionnaire.questions}
        />
      </main>
    </div>
  );
}
