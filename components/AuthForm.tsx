"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { ErrorBanner, Input, Label } from "@/components/ui";
import type { ActionState } from "@/lib/form";

export function AuthForm({
  action,
  mode,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "login" | "register";
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBanner message={state?.error} />
      {mode === "register" ? (
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>
      ) : null}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          minLength={mode === "register" ? 8 : undefined}
          required
        />
        {mode === "register" ? (
          <p className="mt-1 text-sm text-muted">At least 8 characters.</p>
        ) : null}
      </div>
      <SubmitButton pendingLabel={mode === "login" ? "Signing in…" : "Creating account…"}>
        {mode === "login" ? "Sign in" : "Create account"}
      </SubmitButton>
    </form>
  );
}
