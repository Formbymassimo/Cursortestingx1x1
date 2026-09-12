import Link from "next/link";
import { notFound } from "next/navigation";
import { createQuestionnaireAction } from "@/app/actions/questionnaires";
import { QuestionBuilder } from "@/components/QuestionBuilder";
import { requireUser } from "@/lib/auth";
import { getProjectForUser } from "@/lib/services/projects";

export default async function NewQuestionnairePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await getProjectForUser(projectId, user.id);
  if (!project) notFound();

  const action = createQuestionnaireAction.bind(null, project.id);

  return (
    <div>
      <p className="text-sm text-muted">
        <Link href="/projects" className="underline">
          Projects
        </Link>{" "}
        /{" "}
        <Link href={`/projects/${project.id}`} className="underline">
          {project.name}
        </Link>{" "}
        / New questionnaire
      </p>
      <h1 className="mt-2 text-3xl">New questionnaire</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Add questions in the order participants should see them. After you save,
        you get a unique invite link.
      </p>
      <div className="mt-6">
        <QuestionBuilder action={action} />
      </div>
    </div>
  );
}
