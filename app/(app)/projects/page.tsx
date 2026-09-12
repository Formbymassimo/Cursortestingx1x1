import Link from "next/link";
import { buttonClass, Card, EmptyState } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { listProjectsForUser } from "@/lib/services/projects";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await listProjectsForUser(user.id);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Projects</h1>
          <p className="mt-1 text-muted">
            Hello {user.name}. Open a project to manage questionnaires and see
            response counts.
          </p>
        </div>
        <Link href="/projects/new" className={buttonClass("primary")}>
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No projects yet">
            <p>Create a project first, then attach a questionnaire.</p>
            <Link
              href="/projects/new"
              className={`${buttonClass("primary")} mt-4`}
            >
              Create project
            </Link>
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4">
          {projects.map((project) => (
            <li key={project.id}>
              <Link href={`/projects/${project.id}`} className="block">
                <Card className="transition-colors hover:border-stone-400">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl">{project.name}</h2>
                      {project.description ? (
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                          {project.description}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted">
                      {project.questionnaireCount} questionnaire
                      {project.questionnaireCount === 1 ? "" : "s"} ·{" "}
                      {project.responseCount} response
                      {project.responseCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
