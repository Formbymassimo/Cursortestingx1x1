import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { buttonClass, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import {
  QUESTION_TYPE_LABELS,
  isQuestionType,
  parseOptions,
} from "@/lib/question-types";
import { getQuestionnaireForUser } from "@/lib/services/questionnaires";
import { inviteUrl } from "@/lib/urls";

export default async function QuestionnairePage({
  params,
}: {
  params: Promise<{ questionnaireId: string }>;
}) {
  const user = await requireUser();
  const { questionnaireId } = await params;
  const questionnaire = await getQuestionnaireForUser(questionnaireId, user.id);
  if (!questionnaire) notFound();

  const link = await inviteUrl(questionnaire.inviteToken);

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
        / {questionnaire.title}
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">{questionnaire.title}</h1>
          <p className="mt-2 text-muted">
            {questionnaire._count.responses} response
            {questionnaire._count.responses === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href={`/questionnaires/${questionnaire.id}/responses`}
          className={buttonClass("primary")}
        >
          View responses
        </Link>
      </div>

      <Card className="mt-8">
        <h2 className="text-lg">Invite link</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Anyone with this link can answer without signing in. Week 1 does not
          send email invites — copy the link and share it yourself.
        </p>
        <p className="mt-3 break-all rounded-lg bg-stone-100 px-3 py-2 font-mono text-sm">
          {link}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton value={link} />
          <Link
            href={`/q/${questionnaire.inviteToken}`}
            className={buttonClass("secondary")}
            target="_blank"
          >
            Open participant form
          </Link>
        </div>
      </Card>

      <h2 className="mt-10 text-xl">Questions</h2>
      <ol className="mt-4 space-y-3">
        {questionnaire.questions.map((question, index) => {
          const type = isQuestionType(question.type) ? question.type : "SHORT_TEXT";
          const options = parseOptions(question.optionsJson);
          return (
            <li key={question.id}>
              <Card>
                <p className="text-sm text-muted">
                  {index + 1}. {QUESTION_TYPE_LABELS[type]}
                  {question.required ? " · Required" : " · Optional"}
                </p>
                <p className="mt-1 font-medium">{question.prompt}</p>
                {options.length > 0 ? (
                  <ul className="mt-2 list-disc pl-5 text-sm text-muted">
                    {options.map((option) => (
                      <li key={option}>{option}</li>
                    ))}
                  </ul>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
