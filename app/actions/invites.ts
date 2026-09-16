"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  emailConfigStatus,
  emailBlockedMessage,
  logEmailEvent,
  parseRecipientEmails,
} from "@/lib/email";
import { field, type ActionState } from "@/lib/form";
import { resendInvite, sendQuestionnaireInvites } from "@/lib/services/invites";

function sentMessage(count: number) {
  return `Sent to ${count} address${count === 1 ? "" : "es"}.`;
}

function missingConfigError() {
  const status = emailConfigStatus();
  logEmailEvent("error", "action_blocked_not_configured", {
    missing: status.missing,
  });
  return { error: emailBlockedMessage() };
}

export async function sendInvitesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const questionnaireId = field(formData, "questionnaireId");
  if (!questionnaireId) {
    return { error: "Questionnaire is missing. Refresh the page and try again." };
  }

  const contactIds = formData
    .getAll("contactId")
    .filter((value): value is string => typeof value === "string" && value.length > 0);
  const extras = parseRecipientEmails(field(formData, "extraEmails"));
  if (extras.invalid.length > 0) {
    return {
      error: `These addresses are not valid: ${extras.invalid.join(", ")}`,
    };
  }
  if (contactIds.length === 0 && extras.emails.length === 0) {
    return { error: "Add at least one contact or email address." };
  }

  if (!emailConfigStatus().ready) return missingConfigError();

  try {
    const result = await sendQuestionnaireInvites({
      ownerId: user.id,
      researcherName: user.name,
      questionnaireId,
      contactIds,
      extraEmails: extras.emails,
    });
    if ("error" in result && result.error) {
      logEmailEvent("error", "send_rejected", {
        questionnaireId,
        message: result.error,
      });
      return { error: result.error };
    }

    const sent = "sent" in result ? result.sent : 0;
    if (!sent) {
      logEmailEvent("error", "send_claimed_zero", { questionnaireId });
      return { error: "No invite emails were sent. Add a recipient and try again." };
    }

    logEmailEvent("info", "send_complete", { questionnaireId, sent });
    revalidatePath(`/questionnaires/${questionnaireId}`);
    revalidatePath("/contacts");
    return { success: sentMessage(sent) };
  } catch (error) {
    logEmailEvent("error", "send_threw", {
      questionnaireId,
      message: error instanceof Error ? error.message : "unknown",
    });
    return {
      error: error instanceof Error ? error.message : "The invite email could not be sent.",
    };
  }
}

export async function resendInviteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  if (!emailConfigStatus().ready) return missingConfigError();

  const questionnaireId = field(formData, "questionnaireId");
  const inviteId = field(formData, "inviteId");
  if (!questionnaireId || !inviteId) {
    return { error: "That invite could not be found. Refresh the page and try again." };
  }

  try {
    const result = await resendInvite({
      ownerId: user.id,
      researcherName: user.name,
      inviteId,
    });
    if ("error" in result && result.error) {
      logEmailEvent("error", "resend_rejected", {
        questionnaireId,
        message: result.error,
      });
      return { error: result.error };
    }

    const sent = "sent" in result ? result.sent : 0;
    if (!sent) {
      return { error: "The invite email could not be sent." };
    }

    logEmailEvent("info", "resend_complete", { questionnaireId, sent });
    revalidatePath(`/questionnaires/${questionnaireId}`);
    return { success: sentMessage(sent) };
  } catch (error) {
    logEmailEvent("error", "resend_threw", {
      questionnaireId,
      message: error instanceof Error ? error.message : "unknown",
    });
    return {
      error: error instanceof Error ? error.message : "The invite email could not be sent.",
    };
  }
}
