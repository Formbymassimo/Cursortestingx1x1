"use client";

import { useActionState, useMemo, useState } from "react";
import { createQuestionnaireAction } from "@/app/actions/questionnaires";
import { SubmitButton } from "@/components/SubmitButton";
import { Button, ErrorBanner, Input, Label, Select, Textarea } from "@/components/ui";
import {
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
  isChoiceType,
  type QuestionType,
} from "@/lib/question-types";

type DraftQuestion = {
  key: string;
  prompt: string;
  type: QuestionType;
  required: boolean;
  options: string[];
};

let nextDraftId = 1;

function newQuestion(): DraftQuestion {
  nextDraftId += 1;
  return {
    key: `question-${nextDraftId}`,
    prompt: "",
    type: "SHORT_TEXT",
    required: true,
    options: ["", ""],
  };
}

export function QuestionBuilder({ projectId }: { projectId: string }) {
  const [state, formAction] = useActionState(createQuestionnaireAction, undefined);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion()]);

  const payload = useMemo(
    () =>
      JSON.stringify(
        questions.map((question) => ({
          prompt: question.prompt,
          type: question.type,
          required: question.required,
          options: isChoiceType(question.type)
            ? question.options.map((option) => option.trim()).filter(Boolean)
            : [],
        })),
      ),
    [questions],
  );

  function update(key: string, patch: Partial<DraftQuestion>) {
    setQuestions((current) =>
      current.map((question) =>
        question.key === key ? { ...question, ...patch } : question,
      ),
    );
  }

  function move(index: number, direction: -1 | 1) {
    setQuestions((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <ErrorBanner message={state?.error} />
      <div>
        <Label htmlFor="title">Questionnaire title</Label>
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          placeholder="Weekday lunch habits"
        />
      </div>

      <ol className="space-y-4">
        {questions.map((question, index) => (
          <li key={question.key} className="rounded-2xl border border-line bg-card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-muted">Question {index + 1}</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => move(index, -1)}>
                  Move up
                </Button>
                <Button variant="ghost" onClick={() => move(index, 1)}>
                  Move down
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setQuestions((current) =>
                      current.length === 1
                        ? current
                        : current.filter((item) => item.key !== question.key),
                    )
                  }
                >
                  Remove
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
              <div>
                <Label htmlFor={`prompt-${question.key}`}>Prompt</Label>
                <Textarea
                  id={`prompt-${question.key}`}
                  value={question.prompt}
                  onChange={(event) => update(question.key, { prompt: event.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`type-${question.key}`}>Type</Label>
                  <Select
                    id={`type-${question.key}`}
                    value={question.type}
                    onChange={(event) =>
                      update(question.key, { type: event.target.value as QuestionType })
                    }
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {QUESTION_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </Select>
                </div>
                <label className="flex items-center gap-2 text-sm text-stone-800">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(event) =>
                      update(question.key, { required: event.currentTarget.checked })
                    }
                  />
                  Required
                </label>
              </div>
            </div>

            {isChoiceType(question.type) ? (
              <fieldset className="mt-4">
                <legend className="mb-2 text-sm font-medium text-stone-800">
                  Answer options
                </legend>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={`${question.key}-opt-${optionIndex}`} className="flex gap-2">
                      <Input
                        value={option}
                        aria-label={`Option ${optionIndex + 1}`}
                        onChange={(event) => {
                          const options = [...question.options];
                          options[optionIndex] = event.target.value;
                          update(question.key, { options });
                        }}
                      />
                      <Button
                        variant="ghost"
                        onClick={() =>
                          update(question.key, {
                            options:
                              question.options.length > 2
                                ? question.options.filter((_, i) => i !== optionIndex)
                                : question.options,
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  className="mt-3"
                  onClick={() =>
                    update(question.key, { options: [...question.options, ""] })
                  }
                >
                  Add option
                </Button>
              </fieldset>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={() => setQuestions((current) => [...current, newQuestion()])}
        >
          Add question
        </Button>
        <form action={formAction}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="title" value={title} />
          <input type="hidden" name="questions" value={payload} />
          <SubmitButton pendingLabel="Creating…">Create questionnaire</SubmitButton>
        </form>
      </div>
    </div>
  );
}
