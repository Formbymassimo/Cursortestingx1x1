import Link from "next/link";
import { createProjectAction } from "@/app/actions/projects";
import { ProjectForm } from "@/components/ProjectForm";
import { Card } from "@/components/ui";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm text-muted">
        <Link href="/projects" className="underline">
          Projects
        </Link>{" "}
        / New
      </p>
      <h1 className="mt-2 text-3xl">New project</h1>
      <p className="mt-2 text-muted">
        A project holds one or more questionnaires for the same study.
      </p>
      <Card className="mt-6">
        <ProjectForm action={createProjectAction} />
      </Card>
    </div>
  );
}
