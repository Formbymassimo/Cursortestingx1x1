import Link from "next/link";
import { notFound } from "next/navigation";
import { updateContactAction } from "@/app/actions/contacts";
import { ContactForm } from "@/components/ContactForm";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getContactForUser, relationLabel } from "@/lib/services/contacts";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const user = await requireUser();
  const { contactId } = await params;
  const contact = await getContactForUser(contactId, user.id);
  if (!contact) notFound();

  const action = updateContactAction.bind(null, contact.id);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted">
          <Link href="/contacts" className="underline">
            Contacts
          </Link>{" "}
          / {contact.name}
        </p>
        <h1 className="mt-2 text-3xl">{contact.name}</h1>
        <p className="mt-2 text-sm text-muted">
          Added {contact.createdAt.toLocaleDateString()} · Updated{" "}
          {contact.updatedAt.toLocaleDateString()}
        </p>
      </div>

      <Card>
        <h2 className="text-lg">Details</h2>
        <div className="mt-4">
          <ContactForm
            action={action}
            submitLabel="Save contact"
            initial={contact}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg">Projects</h2>
        {contact.projectLinks.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            This person is not linked to a project yet. Attach them from a project
            page, or they will appear here after they respond or receive an invite.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {contact.projectLinks.map((link) => (
              <li key={link.id} className="flex flex-wrap justify-between gap-2 text-sm">
                <Link href={`/projects/${link.project.id}`} className="underline">
                  {link.project.name}
                </Link>
                <span className="text-muted">{relationLabel(link)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="text-lg">Recent responses</h2>
        {contact.responses.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No questionnaire responses yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {contact.responses.map((response) => (
              <li key={response.id}>
                <Link
                  href={`/questionnaires/${response.questionnaire.id}/responses`}
                  className="underline"
                >
                  {response.questionnaire.title}
                </Link>
                <span className="text-muted">
                  {" "}
                  · {response.createdAt.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
