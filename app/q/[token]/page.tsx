import { notFound } from "next/navigation";
import { submitResponseAction } from "@/app/actions/responses";
import { PublicQuestionnaireForm } from "@/components/PublicQuestionnaireForm";
import { getPublicQuestionnaire } from "@/lib/services/questionnaires";

export default async function PublicQuestionnairePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const questionnaire = await getPublicQuestionnaire(token);
  if (!questionnaire) notFound();

  const action = submitResponseAction.bind(null, token);

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
          questions are marked with an asterisk.
        </p>
        <PublicQuestionnaireForm
          action={action}
          questions={questionnaire.questions}
        />
      </main>
    </div>
  );
}
