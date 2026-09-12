import assert from "node:assert/strict";
import { test } from "node:test";
import {
  participantSchema,
  projectSchema,
  questionnaireDraftSchema,
  registerSchema,
} from "@/lib/validation";

test("register schema accepts a complete researcher account", () => {
  const parsed = registerSchema.safeParse({
    name: "Avery Chen",
    email: "avery@example.com",
    password: "long-enough",
  });
  assert.equal(parsed.success, true);
});

test("project schema requires a name", () => {
  const parsed = projectSchema.safeParse({ name: "   ", description: "" });
  assert.equal(parsed.success, false);
});

test("questionnaire schema requires two options for choice questions", () => {
  const parsed = questionnaireDraftSchema.safeParse({
    title: "Lunch",
    questions: [
      {
        prompt: "Where?",
        type: "SINGLE_CHOICE",
        required: true,
        options: ["Dining hall"],
      },
    ],
  });
  assert.equal(parsed.success, false);
});

test("participant consent is required", () => {
  const parsed = participantSchema.safeParse({
    participantName: "Jordan",
    participantEmail: "jordan@example.com",
    consent: "",
  });
  assert.equal(parsed.success, false);
});

test("participant email may be blank", () => {
  const parsed = participantSchema.safeParse({
    participantName: "",
    participantEmail: "",
    consent: "yes",
  });
  assert.equal(parsed.success, true);
});
