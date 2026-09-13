import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClass, Card, EmptyState } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { answersByQuestion } from "@/lib/services/responses";
import { getQuestionnaireResponses } from "@/lib/services/questionnaires";

export default async function ResponsesPage({
  params,
}: {
  params: Promise<{ questionnaireId: string }>;
}) {
  const user = await requireUser();
  const { questionnaireId } = await params;
  const questionnaire = await getQuestionnaireResponses(questionnaireId, user.id);
  if (!questionnaire) notFound();

  return (
    <div>
      <p className="text-sm text-muted">
        <Link href="/projects" className="underline">
          Projects
        </Link>{" "}
        /{" "}
        <Link href={`/projects/${questionnaire.project.id}`} className="underline">
          {questionnaire.project.name}
        </Link>{" "}
        /{" "}
        <Link href={`/questionnaires/${questionnaire.id}`} className="underline">
          {questionnaire.title}
        </Link>{" "}
        / Responses
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Responses</h1>
          <p className="mt-2 text-muted">
            {questionnaire.responses.length} submitted
            {questionnaire.responses.length === 1 ? " response" : " responses"}
          </p>
        </div>
        <Link
          href={`/questionnaires/${questionnaire.id}`}
          className={buttonClass("secondary")}
        >
          Back to invite link
        </Link>
      </div>

      {questionnaire.responses.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No responses yet">
            <p>Share the invite link. New submissions will appear in this table.</p>
          </EmptyState>
        </div>
      ) : (
        <Card className="mt-8 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">
                Responses for {questionnaire.title}
              </caption>
              <thead className="bg-stone-100 text-stone-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  {questionnaire.questions.map((question) => (
                    <th key={question.id} className="px-4 py-3 font-medium">
                      {question.prompt}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questionnaire.responses.map((response) => {
                  const answers = answersByQuestion(
                    response.answers,
                    questionnaire.questions,
                  );
                  return (
                    <tr key={response.id} className="border-t border-line align-top">
                      <td className="whitespace-nowrap px-4 py-3 text-muted">
                        {response.createdAt.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {response.contact ? (
                          <Link
                            href={`/contacts/${response.contact.id}`}
                            className="underline"
                          >
                            {response.participantName || response.contact.name}
                          </Link>
                        ) : (
                          response.participantName || "—"
                        )}
                      </td>
                      <td className="px-4 py-3">{response.participantEmail || "—"}</td>
                      {answers.map((answer) => (
                        <td key={answer.questionId} className="max-w-xs px-4 py-3">
                          {answer.display || "—"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
