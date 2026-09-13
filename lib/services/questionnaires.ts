import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { QuestionType } from "@/lib/question-types";

export function createInviteToken() {
  return randomBytes(12).toString("base64url");
}

export async function createQuestionnaire(input: {
  projectId: string;
  ownerId: string;
  title: string;
  questions: {
    prompt: string;
    type: QuestionType;
    required: boolean;
    options: string[];
  }[];
}) {
  const project = await prisma.project.findFirst({
    where: { id: input.projectId, ownerId: input.ownerId },
    select: { id: true },
  });
  if (!project) return null;

  return prisma.questionnaire.create({
    data: {
      projectId: project.id,
      title: input.title,
      inviteToken: createInviteToken(),
      questions: {
        create: input.questions.map((question, index) => ({
          sortOrder: index,
          prompt: question.prompt,
          type: question.type,
          required: question.required,
          optionsJson: JSON.stringify(question.options),
        })),
      },
    },
  });
}

export async function getQuestionnaireForUser(
  questionnaireId: string,
  ownerId: string,
) {
  return prisma.questionnaire.findFirst({
    where: { id: questionnaireId, project: { ownerId } },
    include: {
      project: true,
      questions: { orderBy: { sortOrder: "asc" } },
      _count: { select: { responses: true } },
    },
  });
}

export async function getPublicQuestionnaire(token: string) {
  return prisma.questionnaire.findUnique({
    where: { inviteToken: token },
    include: {
      project: { select: { id: true, name: true, ownerId: true } },
      questions: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getQuestionnaireResponses(
  questionnaireId: string,
  ownerId: string,
) {
  const questionnaire = await prisma.questionnaire.findFirst({
    where: { id: questionnaireId, project: { ownerId } },
    include: {
      project: true,
      questions: { orderBy: { sortOrder: "asc" } },
      responses: {
        orderBy: { createdAt: "desc" },
        include: { answers: true, contact: { select: { id: true, name: true } } },
      },
    },
  });

  return questionnaire;
}
