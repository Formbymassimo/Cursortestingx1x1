"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { ErrorBanner, Input, Label, Textarea } from "@/components/ui";
import type { ActionState } from "@/lib/form";
import { parseOptions } from "@/lib/question-types";

type PublicQuestion = {
  id: string;
  prompt: string;
  type: string;
  required: boolean;
  optionsJson: string;
};

export function PublicQuestionnaireForm({
  action,
  questions,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  questions: PublicQuestion[];
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-8">
      <ErrorBanner message={state?.error} />

      <fieldset className="space-y-4 rounded-2xl border border-line bg-card p-5">
        <legend className="px-1 text-sm font-medium text-stone-800">
          About you (optional)
        </legend>
        <p className="text-sm text-muted">
          You can leave these blank. If you add them, the researcher can follow
          up later.
        </p>
        <div>
          <Label htmlFor="participantName">Name</Label>
          <Input id="participantName" name="participantName" autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="participantEmail">Email</Label>
          <Input
            id="participantEmail"
            name="participantEmail"
            type="email"
            autoComplete="email"
          />
        </div>
      </fieldset>

      <ol className="space-y-5">
        {questions.map((question, index) => {
          const options = parseOptions(question.optionsJson);
          const name = `q_${question.id}`;
          return (
            <li key={question.id} className="rounded-2xl border border-line bg-card p-5">
              <p className="mb-3 font-medium text-stone-900">
                <span className="mr-2 text-muted">{index + 1}.</span>
                {question.prompt}
                {question.required ? (
                  <span className="ml-1 text-danger" aria-hidden>
                    *
                  </span>
                ) : (
                  <span className="ml-2 text-sm font-normal text-muted">Optional</span>
                )}
              </p>

              {question.type === "SHORT_TEXT" ? (
                <Input name={name} required={question.required} />
              ) : null}

              {question.type === "LONG_TEXT" ? (
                <Textarea name={name} rows={5} required={question.required} />
              ) : null}

              {question.type === "SINGLE_CHOICE" ? (
                <div className="space-y-2">
                  {options.map((option) => (
                    <label key={option} className="flex items-start gap-2 text-stone-800">
                      <input
                        type="radio"
                        name={name}
                        value={option}
                        required={question.required}
                        className="mt-1"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : null}

              {question.type === "MULTIPLE_CHOICE" ? (
                <div className="space-y-2">
                  {options.map((option) => (
                    <label key={option} className="flex items-start gap-2 text-stone-800">
                      <input
                        type="checkbox"
                        name={name}
                        value={option}
                        className="mt-1"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <fieldset className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <legend className="px-1 text-sm font-medium text-stone-900">
          Research consent
        </legend>
        <p className="text-sm leading-6 text-stone-800">
          Your answers will be used for research. Do not include information you
          are not comfortable sharing. You may skip your name and email.
        </p>
        <label className="flex items-start gap-2 text-sm text-stone-900">
          <input type="checkbox" name="consent" value="yes" required className="mt-1" />
          <span>I understand that my answers will be used for research.</span>
        </label>
      </fieldset>

      <SubmitButton pendingLabel="Submitting…">Submit answers</SubmitButton>
    </form>
  );
}
