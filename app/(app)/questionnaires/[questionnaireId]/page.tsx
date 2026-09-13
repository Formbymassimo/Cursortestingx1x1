import Link from "next/link";
import { notFound } from "next/navigation";
import { resendInviteAction, sendInvitesAction } from "@/app/actions/invites";
import { ActionMessageForm } from "@/components/ActionMessageForm";
import { CopyButton } from "@/components/CopyButton";
import { InviteForm } from "@/components/InviteForm";
import { buttonClass, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { emailConfigured, emailSetupMessage } from "@/lib/email";
import {
  QUESTION_TYPE_LABELS,
  isQuestionType,
  parseOptions,
} from "@/lib/question-types";
import { listContactsForUser } from "@/lib/services/contacts";
import { listInvitesForQuestionnaire } from "@/lib/services/invites";
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
  const contacts = await listContactsForUser(user.id);
  const invites = await listInvitesForQuestionnaire(questionnaire.id, user.id);
  const sendAction = sendInvitesAction.bind(null, questionnaire.id);

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
          Anyone with this link can answer without signing in. Copy it, or email
          it to contacts below.
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

      <Card className="mt-6">
        <h2 className="text-lg">Email invites</h2>
        <p className="mt-2 mb-4 text-sm leading-6 text-muted">
          Select saved contacts and/or type extra addresses. Each send is stored
          so you can resend later.
        </p>
        <InviteForm
          contacts={contacts}
          action={sendAction}
          emailReady={emailConfigured()}
          setupMessage={emailSetupMessage()}
        />
      </Card>

      {invites.length > 0 ? (
        <Card className="mt-6">
          <h2 className="text-lg">Sent invites</h2>
          <ul className="mt-4 divide-y divide-line">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {invite.contact ? (
                      <Link href={`/contacts/${invite.contact.id}`} className="underline">
                        {invite.contact.name}
                      </Link>
                    ) : (
                      invite.email
                    )}
                  </p>
                  <p className="text-muted">
                    {invite.email} · sent {invite.sendCount}{" "}
                    {invite.sendCount === 1 ? "time" : "times"} · last{" "}
                    {invite.lastSentAt.toLocaleString()}
                  </p>
                </div>
                <ActionMessageForm
                  action={resendInviteAction.bind(null, questionnaire.id, invite.id)}
                  label="Resend"
                  pendingLabel="Sending…"
                />
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

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
