"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { ErrorBanner, Input, Label, Textarea } from "@/components/ui";
import type { ActionState } from "@/lib/form";

export function ContactForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: {
    name: string;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    tags?: string[];
  };
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBanner message={state?.error} />
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={initial?.name} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={initial?.email ?? ""}
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" defaultValue={initial?.phone ?? ""} />
      </div>
      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={initial?.tags?.join(", ") ?? ""}
          placeholder="student, follow-up"
        />
        <p className="mt-1 text-sm text-muted">Separate tags with commas.</p>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={4} defaultValue={initial?.notes ?? ""} />
      </div>
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
