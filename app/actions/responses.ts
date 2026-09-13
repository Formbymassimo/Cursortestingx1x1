"use server";

import { redirect } from "next/navigation";
import { field, firstIssue, type ActionState } from "@/lib/form";
import { upsertContactFromResponse } from "@/lib/services/contacts";
import { getPublicQuestionnaire } from "@/lib/services/questionnaires";
import {
  collectAnswers,
  submitResponse,
  validateAnswers,
} from "@/lib/services/responses";
import { participantSchema } from "@/lib/validation";

export async function submitResponseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = field(formData, "token");
  const questionnaire = await getPublicQuestionnaire(token);
  if (!questionnaire) return { error: "This questionnaire is no longer available." };

  const participant = participantSchema.safeParse({
    participantName: field(formData, "participantName"),
    participantEmail: field(formData, "participantEmail"),
    consent: field(formData, "consent"),
  });
  if (!participant.success) return { error: firstIssue(participant.error) };

  const answers = collectAnswers(
    formData,
    questionnaire.questions.map((question) => question.id),
  );
  const answerError = validateAnswers(questionnaire.questions, answers);
  if (answerError) return { error: answerError };

  const contact = await upsertContactFromResponse({
    ownerId: questionnaire.project.ownerId,
    projectId: questionnaire.project.id,
    name: participant.data.participantName,
    email: participant.data.participantEmail,
  });

  await submitResponse({
    questionnaireId: questionnaire.id,
    participantName: participant.data.participantName,
    participantEmail: participant.data.participantEmail,
    contactId: contact?.id,
    questions: questionnaire.questions,
    answers,
  });

  redirect(`/q/${token}/thanks`);
}
