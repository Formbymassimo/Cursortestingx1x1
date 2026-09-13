"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { field, firstIssue, type ActionState } from "@/lib/form";
import { createProject } from "@/lib/services/projects";
import { projectSchema } from "@/lib/validation";

export async function createProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = projectSchema.safeParse({
    name: field(formData, "name"),
    description: field(formData, "description"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const project = await createProject(user.id, {
    name: parsed.data.name,
    description: parsed.data.description,
  });

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}
