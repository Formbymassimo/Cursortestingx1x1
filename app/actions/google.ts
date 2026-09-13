"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { field, type ActionState } from "@/lib/form";
import {
  disconnectGoogle,
  googleConfigured,
  googleSetupMessage,
  linkGoogleForm,
  syncGoogleFormResponses,
  unlinkGoogleForm,
} from "@/lib/services/google";

export async function disconnectGoogleAction() {
  const user = await requireUser();
  await disconnectGoogle(user.id);
  revalidatePath("/settings");
  revalidatePath("/projects");
}

export async function linkGoogleFormAction(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  if (!googleConfigured()) return { error: googleSetupMessage() };

  try {
    const result = await linkGoogleForm({
      userId: user.id,
      projectId,
      formUrlOrId: field(formData, "formUrlOrId"),
    });
    if ("error" in result && result.error) return { error: result.error };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not link that Google Form.",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  return undefined;
}

export async function unlinkGoogleFormAction(projectId: string, linkedFormId: string) {
  const user = await requireUser();
  const result = await unlinkGoogleForm(user.id, linkedFormId);
  if ("error" in result && result.error) return;
  revalidatePath(`/projects/${projectId}`);
}

export async function syncGoogleFormAction(projectId: string, linkedFormId: string) {
  const user = await requireUser();
  if (!googleConfigured()) return { error: googleSetupMessage() };
  try {
    await syncGoogleFormResponses(user.id, linkedFormId);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not sync Google Form responses.",
    };
  }
  revalidatePath(`/projects/${projectId}`);
  return undefined;
}
