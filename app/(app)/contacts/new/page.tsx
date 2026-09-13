import Link from "next/link";
import { createContactAction } from "@/app/actions/contacts";
import { ContactForm } from "@/components/ContactForm";
import { Card } from "@/components/ui";

export default function NewContactPage() {
  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm text-muted">
        <Link href="/contacts" className="underline">
          Contacts
        </Link>{" "}
        / New
      </p>
      <h1 className="mt-2 text-3xl">New contact</h1>
      <p className="mt-2 text-muted">
        Save a person you may invite later. Email is optional, but needed to send
        invites.
      </p>
      <Card className="mt-6">
        <ContactForm action={createContactAction} submitLabel="Create contact" />
      </Card>
    </div>
  );
}
