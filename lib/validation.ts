import { z } from "zod";
import { isChoiceType, isQuestionType } from "@/lib/question-types";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required.").max(160),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

const questionDraftSchema = z
  .object({
    prompt: z.string().trim().min(1, "Each question needs a prompt.").max(500),
    type: z.string(),
    required: z.boolean(),
    options: z.array(z.string().trim().min(1).max(200)).max(20),
  })
  .superRefine((question, ctx) => {
    if (!isQuestionType(question.type)) {
      ctx.addIssue({
        code: "custom",
        message: "Unsupported question type.",
        path: ["type"],
      });
      return;
    }
    if (isChoiceType(question.type) && question.options.length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Choice questions need at least two options.",
        path: ["options"],
      });
    }
  });

export const questionnaireDraftSchema = z.object({
  title: z.string().trim().min(1, "Questionnaire title is required.").max(200),
  questions: z
    .array(questionDraftSchema)
    .min(1, "Add at least one question.")
    .max(50, "Keep questionnaires to 50 questions or fewer."),
});

export const participantSchema = z.object({
  participantName: z.string().trim().max(120).optional().or(z.literal("")),
  participantEmail: z
    .string()
    .trim()
    .max(254)
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Enter a valid email, or leave it blank.",
    }),
  consent: z.literal("yes", {
    error: "Please confirm that your answers will be used for research.",
  }),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z
    .string()
    .trim()
    .max(254)
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Enter a valid email, or leave it blank.",
    }),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
  tags: z.string().trim().max(400).optional().or(z.literal("")),
});

export const inviteEmailsSchema = z.object({
  extraEmails: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type QuestionnaireDraft = z.infer<typeof questionnaireDraftSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
