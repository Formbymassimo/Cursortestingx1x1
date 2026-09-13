"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { emailConfigured, emailSetupMessage } from "@/lib/email";
import { field, type ActionState } from "@/lib/form";
import { resendInvite, sendQuestionnaireInvites } from "@/lib/services/invites";

function extraEmails(value: string) {
  return value
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function sendInvitesAction(
  questionnaireId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  if (!emailConfigured()) return { error: emailSetupMessage() };

  const contactIds = formData
    .getAll("contactId")
    .filter((value): value is string => typeof value === "string");

  try {
    const result = await sendQuestionnaireInvites({
      ownerId: user.id,
      researcherName: user.name,
      questionnaireId,
      contactIds,
      extraEmails: extraEmails(field(formData, "extraEmails")),
    });
    if ("error" in result && result.error) return { error: result.error };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "The invite email could not be sent.",
    };
  }

  revalidatePath(`/questionnaires/${questionnaireId}`);
  revalidatePath("/contacts");
  return undefined;
}

export async function resendInviteAction(
  questionnaireId: string,
  inviteId: string,
): Promise<ActionState> {
  const user = await requireUser();
  if (!emailConfigured()) return { error: emailSetupMessage() };

  try {
    const result = await resendInvite({
      ownerId: user.id,
      researcherName: user.name,
      inviteId,
    });
    if ("error" in result && result.error) return { error: result.error };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "The invite email could not be sent.",
    };
  }

  revalidatePath(`/questionnaires/${questionnaireId}`);
  return undefined;
}
