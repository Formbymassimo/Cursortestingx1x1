"use client";

import { useActionState, useMemo, useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { ErrorBanner, Input } from "@/components/ui";
import type { ActionState } from "@/lib/form";

type PickerContact = {
  id: string;
  name: string;
  email: string | null;
};

export function ContactPicker({
  contacts,
  action,
  submitLabel,
  emptyLabel,
}: {
  contacts: PickerContact[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  emptyLabel: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return contacts;
    return contacts.filter((contact) =>
      `${contact.name} ${contact.email ?? ""}`.toLowerCase().includes(needle),
    );
  }, [contacts, query]);

  if (contacts.length === 0) {
    return <p className="text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBanner message={state?.error} />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filter contacts"
        aria-label="Filter contacts"
      />
      <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-line bg-white p-3">
        {visible.map((contact) => (
          <li key={contact.id}>
            <label className="flex items-start gap-2 text-sm text-stone-800">
              <input type="checkbox" name="contactId" value={contact.id} className="mt-1" />
              <span>
                <span className="font-medium">{contact.name}</span>
                {contact.email ? (
                  <span className="block text-muted">{contact.email}</span>
                ) : (
                  <span className="block text-muted">No email</span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
