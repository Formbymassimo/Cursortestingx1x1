"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { ErrorBanner } from "@/components/ui";
import type { ActionState } from "@/lib/form";

export function ActionMessageForm({
  action,
  label,
  pendingLabel,
}: {
  action: () => Promise<ActionState>;
  label: string;
  pendingLabel?: string;
}) {
  const [state, formAction] = useActionState(async () => action(), undefined);
  return (
    <form action={formAction} className="space-y-2">
      <ErrorBanner message={state?.error} />
      <SubmitButton variant="secondary" pendingLabel={pendingLabel}>
        {label}
      </SubmitButton>
    </form>
  );
}
