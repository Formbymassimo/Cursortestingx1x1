"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { field, firstIssue, type ActionState } from "@/lib/form";
import { isQuestionType } from "@/lib/question-types";
import { createQuestionnaire } from "@/lib/services/questionnaires";
import { questionnaireDraftSchema } from "@/lib/validation";

export async function createQuestionnaireAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const projectId = field(formData, "projectId");
  if (!projectId) return { error: "Project is missing." };
  let questionsRaw: unknown = [];
  try {
    questionsRaw = JSON.parse(field(formData, "questions"));
  } catch {
    return { error: "Could not read the question list. Please try again." };
  }

  const parsed = questionnaireDraftSchema.safeParse({
    title: field(formData, "title"),
    questions: questionsRaw,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const questions = parsed.data.questions.map((question) => {
    if (!isQuestionType(question.type)) {
      throw new Error("Unsupported question type.");
    }
    return {
      prompt: question.prompt,
      type: question.type,
      required: question.required,
      options: question.options.filter(Boolean),
    };
  });

  const questionnaire = await createQuestionnaire({
    projectId,
    ownerId: user.id,
    title: parsed.data.title,
    questions,
  });
  if (!questionnaire) return { error: "Project not found." };

  revalidatePath(`/projects/${projectId}`);
  redirect(`/questionnaires/${questionnaire.id}`);
}
