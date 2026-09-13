"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { ErrorBanner, Label, Textarea } from "@/components/ui";
import type { ActionState } from "@/lib/form";

type PickerContact = {
  id: string;
  name: string;
  email: string | null;
};

export function InviteForm({
  contacts,
  action,
  emailReady,
  setupMessage,
}: {
  contacts: PickerContact[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  emailReady: boolean;
  setupMessage: string;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBanner message={state?.error} />
      {!emailReady ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-stone-800">
          {setupMessage}
        </p>
      ) : null}
      {contacts.length > 0 ? (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-stone-800">
            Contacts
          </legend>
          <ul className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-line bg-white p-3">
            {contacts.map((contact) => (
              <li key={contact.id}>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="contactId"
                    value={contact.id}
                    className="mt-1"
                    disabled={!contact.email}
                  />
                  <span>
                    <span className="font-medium">{contact.name}</span>
                    <span className="block text-muted">
                      {contact.email || "Add an email on the contact card first"}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : (
        <p className="text-sm text-muted">
          No contacts yet. Create a contact card, or type email addresses below.
        </p>
      )}
      <div>
        <Label htmlFor="extraEmails">Additional email addresses</Label>
        <Textarea
          id="extraEmails"
          name="extraEmails"
          rows={3}
          placeholder="one@example.com, two@example.com"
        />
      </div>
      <SubmitButton pendingLabel="Sending…">
        Send invite emails
      </SubmitButton>
    </form>
  );
}
