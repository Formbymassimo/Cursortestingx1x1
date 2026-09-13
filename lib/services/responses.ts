import { prisma } from "@/lib/prisma";
import {
  formatAnswerValue,
  isChoiceType,
  isQuestionType,
  parseOptions,
  type QuestionType,
} from "@/lib/question-types";

export type AnswerInput = Record<string, string | string[] | undefined>;

export function collectAnswers(formData: FormData, questionIds: string[]) {
  const answers: AnswerInput = {};
  for (const id of questionIds) {
    const all = formData.getAll(`q_${id}`).filter((value): value is string => typeof value === "string");
    if (all.length > 1) answers[id] = all;
    else answers[id] = all[0];
  }
  return answers;
}

export function validateAnswers(
  questions: {
    id: string;
    prompt: string;
    type: string;
    required: boolean;
    optionsJson: string;
  }[],
  answers: AnswerInput,
) {
  for (const question of questions) {
    if (!isQuestionType(question.type)) {
      return `Question "${question.prompt}" has an unsupported type.`;
    }
    const raw = answers[question.id];
    const options = parseOptions(question.optionsJson);

    if (question.type === "MULTIPLE_CHOICE") {
      const selected = Array.isArray(raw) ? raw : raw ? [raw] : [];
      if (question.required && selected.length === 0) {
        return `Please answer: ${question.prompt}`;
      }
      if (selected.some((value) => !options.includes(value))) {
        return `Please choose a listed option for: ${question.prompt}`;
      }
      continue;
    }

    const value = Array.isArray(raw) ? raw[0] : raw;
    if (question.required && !value?.trim()) {
      return `Please answer: ${question.prompt}`;
    }
    if (question.type === "SINGLE_CHOICE" && value && !options.includes(value)) {
      return `Please choose a listed option for: ${question.prompt}`;
    }
    if ((question.type === "SHORT_TEXT" || question.type === "LONG_TEXT") && value && value.length > 5000) {
      return `Answer is too long for: ${question.prompt}`;
    }
  }
  return null;
}

export async function submitResponse(input: {
  questionnaireId: string;
  participantName?: string;
  participantEmail?: string;
  questions: {
    id: string;
    type: string;
    optionsJson: string;
  }[];
  answers: AnswerInput;
}) {
  return prisma.response.create({
    data: {
      questionnaireId: input.questionnaireId,
      participantName: input.participantName || null,
      participantEmail: input.participantEmail || null,
      answers: {
        create: input.questions.map((question) => {
          const raw = input.answers[question.id];
          const type = question.type as QuestionType;
          let value = "";
          if (type === "MULTIPLE_CHOICE") {
            const selected = Array.isArray(raw) ? raw : raw ? [raw] : [];
            value = JSON.stringify(selected);
          } else {
            value = (Array.isArray(raw) ? raw[0] : raw) ?? "";
          }
          return { questionId: question.id, value };
        }),
      },
    },
  });
}

export function answersByQuestion(
  answers: { questionId: string; value: string }[],
  questions: { id: string; type: string }[],
) {
  const map = new Map(answers.map((answer) => [answer.questionId, answer.value]));
  return questions.map((question) => {
    const value = map.get(question.id) ?? "";
    const type = isQuestionType(question.type) ? question.type : "SHORT_TEXT";
    return {
      questionId: question.id,
      display: formatAnswerValue(type, value),
    };
  });
}

export function isChoiceQuestion(type: string) {
  return isQuestionType(type) && isChoiceType(type);
}
