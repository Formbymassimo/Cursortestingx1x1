export const QUESTION_TYPES = [
  "SHORT_TEXT",
  "LONG_TEXT",
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  SHORT_TEXT: "Short text",
  LONG_TEXT: "Long text",
  SINGLE_CHOICE: "Single choice",
  MULTIPLE_CHOICE: "Multiple choice",
};

export function isQuestionType(value: string): value is QuestionType {
  return (QUESTION_TYPES as readonly string[]).includes(value);
}

export function isChoiceType(type: QuestionType) {
  return type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE";
}

export function parseOptions(optionsJson: string): string[] {
  try {
    const parsed = JSON.parse(optionsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function formatAnswerValue(type: QuestionType, value: string) {
  if (type !== "MULTIPLE_CHOICE") return value;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.join(", ");
  } catch {
    return value;
  }
  return value;
}
