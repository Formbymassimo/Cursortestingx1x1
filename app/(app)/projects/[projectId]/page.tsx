import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClass, Card, EmptyState } from "@/components/ui";
import { requireUser } from "@/lib/auth";
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
            <p>Add a questionnaire, then copy its invite link.</p>
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
                      Invite link
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
    </div>
  );
}
