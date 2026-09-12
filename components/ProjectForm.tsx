"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { ErrorBanner, Input, Label, Textarea } from "@/components/ui";
import type { ActionState } from "@/lib/form";

export function ProjectForm({
  action,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBanner message={state?.error} />
      <div>
        <Label htmlFor="name">Project name</Label>
        <Input id="name" name="name" required maxLength={160} />
      </div>
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          placeholder="What are you studying, and who is this for?"
        />
      </div>
      <SubmitButton pendingLabel="Creating…">Create project</SubmitButton>
    </form>
  );
}
