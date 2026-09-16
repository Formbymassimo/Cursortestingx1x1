"use client";

import { useActionState, type ReactNode } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { ErrorBanner, SuccessBanner } from "@/components/ui";
import type { ActionState } from "@/lib/form";

export function ActionMessageForm({
  action,
  label,
  pendingLabel,
  hiddenFields,
  children,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  label: string;
  pendingLabel?: string;
  hiddenFields?: Record<string, string>;
  children?: ReactNode;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-2">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      <ErrorBanner message={state?.error} />
      <SuccessBanner message={state?.success} />
      {children}
      <SubmitButton variant="secondary" pendingLabel={pendingLabel}>
        {label}
      </SubmitButton>
    </form>
  );
}
