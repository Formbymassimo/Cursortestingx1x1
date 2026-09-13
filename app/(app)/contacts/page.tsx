import Link from "next/link";
import { buttonClass, Card, EmptyState, Input } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { listContactsForUser } from "@/lib/services/contacts";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const contacts = await listContactsForUser(user.id, q);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Contacts</h1>
          <p className="mt-1 text-muted">
            People you invite or who leave a name or email on a questionnaire.
          </p>
        </div>
        <Link href="/contacts/new" className={buttonClass("primary")}>
          New contact
        </Link>
      </div>

      <form className="mt-6 max-w-md" action="/contacts">
        <label htmlFor="q" className="sr-only">
          Search contacts
        </label>
        <div className="flex gap-2">
          <Input id="q" name="q" defaultValue={q ?? ""} placeholder="Search name, email, tags…" />
          <button type="submit" className={buttonClass("secondary")}>
            Search
          </button>
        </div>
      </form>

      {contacts.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={q ? "No matching contacts" : "No contacts yet"}>
            <p>
              {q
                ? "Try another search, or create a contact."
                : "Add a contact, or wait for a participant to leave their name or email."}
            </p>
            <Link href="/contacts/new" className={`${buttonClass("primary")} mt-4`}>
              Create contact
            </Link>
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <Link href={`/contacts/${contact.id}`} className="block">
                <Card className="transition-colors hover:border-stone-400">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl">{contact.name}</h2>
                      <p className="mt-1 text-sm text-muted">
                        {contact.email || "No email"}
                        {contact.phone ? ` · ${contact.phone}` : ""}
                      </p>
                      {contact.tags.length > 0 ? (
                        <p className="mt-2 text-sm text-muted">
                          {contact.tags.join(" · ")}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted">
                      {contact.projectCount} project
                      {contact.projectCount === 1 ? "" : "s"} ·{" "}
                      {contact.responseCount} response
                      {contact.responseCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
