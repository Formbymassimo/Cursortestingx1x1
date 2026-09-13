import Link from "next/link";
import { notFound } from "next/navigation";
import {
  linkGoogleFormAction,
  syncGoogleFormAction,
  unlinkGoogleFormAction,
} from "@/app/actions/google";
import { attachContactsToProjectAction } from "@/app/actions/contacts";
import { ActionMessageForm } from "@/components/ActionMessageForm";
import { ContactPicker } from "@/components/ContactPicker";
import { GoogleFormConnect } from "@/components/GoogleFormConnect";
import { buttonClass, Card, EmptyState } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { listContactsForUser, relationLabel } from "@/lib/services/contacts";
import {
  getGoogleAccount,
  googleConfigured,
  googleSetupMessage,
  listGoogleForms,
} from "@/lib/services/google";
import { getProjectForUser } from "@/lib/services/projects";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await getProjectForUser(projectId, user.id);
  if (!project) notFound();

  const contacts = await listContactsForUser(user.id);
  const linkedIds = new Set(project.contactLinks.map((link) => link.contactId));
  const attachable = contacts.filter((contact) => !linkedIds.has(contact.id));
  const attachAction = attachContactsToProjectAction.bind(null, project.id);
  const linkAction = linkGoogleFormAction.bind(null, project.id);

  const googleReady = googleConfigured();
  const googleAccount = googleReady ? await getGoogleAccount(user.id) : null;
  let googleForms: { id: string; name: string }[] = [];
  let googleListError: string | undefined;
  if (googleAccount) {
    try {
      googleForms = await listGoogleForms(user.id);
    } catch (error) {
      googleListError =
        error instanceof Error ? error.message : "Could not list Google Forms.";
    }
  }

  return (
    <div>
      <p className="text-sm text-muted">
        <Link href="/projects" className="underline">
          Projects
        </Link>{" "}
        / {project.name}
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">{project.name}</h1>
          {project.description ? (
            <p className="mt-2 max-w-2xl text-muted">{project.description}</p>
          ) : null}
        </div>
        <Link
          href={`/projects/${project.id}/questionnaires/new`}
          className={buttonClass("primary")}
        >
          New questionnaire
        </Link>
      </div>

      <h2 className="mt-10 text-xl">Questionnaires</h2>
      {project.questionnaires.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No questionnaires yet">
            <p>Add a questionnaire, then copy its invite link or email contacts.</p>
            <Link
              href={`/projects/${project.id}/questionnaires/new`}
              className={`${buttonClass("primary")} mt-4`}
            >
              Create questionnaire
            </Link>
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {project.questionnaires.map((questionnaire) => (
            <li key={questionnaire.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg">{questionnaire.title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {questionnaire._count.questions} question
                      {questionnaire._count.questions === 1 ? "" : "s"} ·{" "}
                      {questionnaire._count.responses} response
                      {questionnaire._count.responses === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/questionnaires/${questionnaire.id}`}
                      className={buttonClass("secondary")}
                    >
                      Invite
                    </Link>
                    <Link
                      href={`/questionnaires/${questionnaire.id}/responses`}
                      className={buttonClass("primary")}
                    >
                      View responses
                    </Link>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-xl">Contacts</h2>
      <Card className="mt-4">
        {project.contactLinks.length === 0 ? (
          <p className="text-sm text-muted">
            No contacts are linked yet. Attach people you plan to invite, or they
            will appear after they respond.
          </p>
        ) : (
          <ul className="space-y-2">
            {project.contactLinks.map((link) => (
              <li key={link.id} className="flex flex-wrap justify-between gap-2 text-sm">
                <Link href={`/contacts/${link.contact.id}`} className="underline">
                  {link.contact.name}
                </Link>
                <span className="text-muted">{relationLabel(link)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 border-t border-line pt-4">
          <h3 className="text-sm font-medium">Add existing contacts</h3>
          <p className="mt-1 mb-3 text-sm text-muted">
            This marks them as invited for this project. Sending the email happens
            on a questionnaire page.
          </p>
          <ContactPicker
            contacts={attachable}
            action={attachAction}
            submitLabel="Add to project"
            emptyLabel="Every contact is already on this project, or you have not created any yet."
          />
        </div>
      </Card>

      <h2 className="mt-10 text-xl">Google Form</h2>
      <Card className="mt-4 space-y-4">
        {!googleReady ? (
          <p className="text-sm leading-6 text-muted">{googleSetupMessage()}</p>
        ) : !googleAccount ? (
          <p className="text-sm leading-6 text-muted">
            <Link href="/settings" className="underline">
              Connect Google
            </Link>{" "}
            first, then you can link a form to this project.
          </p>
        ) : (
          <GoogleFormConnect
            action={linkAction}
            forms={googleForms}
            listError={googleListError}
          />
        )}

        {project.googleForms.map((form) => (
          <div key={form.id} className="rounded-xl border border-line p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">{form.title}</h3>
                <p className="mt-1 break-all font-mono text-xs text-muted">{form.url}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={form.url}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass("secondary")}
                >
                  Open form
                </a>
                <ActionMessageForm
                  action={syncGoogleFormAction.bind(null, project.id, form.id)}
                  label="Sync responses"
                  pendingLabel="Syncing…"
                />
                <form action={unlinkGoogleFormAction.bind(null, project.id, form.id)}>
                  <button type="submit" className={buttonClass("ghost")}>
                    Unlink
                  </button>
                </form>
              </div>
            </div>
            {form.responses.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <caption className="sr-only">Google Form responses</caption>
                  <thead className="text-muted">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Submitted</th>
                      <th className="py-2 pr-4 font-medium">Email</th>
                      <th className="py-2 font-medium">Answers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.responses.map((response) => {
                      let answers: { question: string; value: string }[] = [];
                      try {
                        answers = JSON.parse(response.answersJson) as {
                          question: string;
                          value: string;
                        }[];
                      } catch {
                        answers = [];
                      }
                      return (
                        <tr key={response.id} className="border-t border-line align-top">
                          <td className="py-2 pr-4 text-muted">
                            {response.submittedAt?.toLocaleString() || "—"}
                          </td>
                          <td className="py-2 pr-4">
                            {response.respondentEmail || "—"}
                          </td>
                          <td className="py-2">
                            {answers.length === 0
                              ? "—"
                              : answers
                                  .map((answer) => `${answer.question}: ${answer.value}`)
                                  .join(" · ")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">
                No synced Google Form responses yet. Participants use the Open form
                link; then click Sync responses.
              </p>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}
