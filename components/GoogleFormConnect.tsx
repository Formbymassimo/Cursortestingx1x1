"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { ErrorBanner, Input, Label, Select } from "@/components/ui";
import type { ActionState } from "@/lib/form";

export function GoogleFormConnect({
  action,
  forms,
  listError,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  forms: { id: string; name: string }[];
  listError?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBanner message={state?.error} />
      {listError ? <p className="text-sm text-muted">{listError}</p> : null}
      {forms.length > 0 ? (
        <div>
          <Label htmlFor="formPick">Pick a form</Label>
          <Select
            id="formPick"
            onChange={(event) => {
              const input = event.currentTarget.form?.elements.namedItem(
                "formUrlOrId",
              );
              if (input instanceof HTMLInputElement) {
                input.value = event.currentTarget.value;
              }
            }}
            defaultValue=""
          >
            <option value="">Choose from Google Drive</option>
            {forms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
      <div>
        <Label htmlFor="formUrlOrId">Google Form edit URL or ID</Label>
        <Input
          id="formUrlOrId"
          name="formUrlOrId"
          required
          placeholder="https://docs.google.com/forms/d/FORM_ID/edit"
        />
      </div>
      <SubmitButton pendingLabel="Linking…">Link Google Form</SubmitButton>
    </form>
  );
}
