"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { field, firstIssue, type ActionState } from "@/lib/form";
import {
  attachContactsToProject,
  createContact,
  tagsFromForm,
  updateContact,
} from "@/lib/services/contacts";
import { contactSchema } from "@/lib/validation";

function contactFields(formData: FormData) {
  return contactSchema.safeParse({
    name: field(formData, "name"),
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    notes: field(formData, "notes"),
    tags: field(formData, "tags"),
  });
}

export async function createContactAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = contactFields(formData);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  let contact;
  try {
    contact = await createContact(user.id, {
      ...parsed.data,
      tags: tagsFromForm(parsed.data.tags ?? ""),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save contact." };
  }

  revalidatePath("/contacts");
  redirect(`/contacts/${contact.id}`);
}

export async function updateContactAction(
  contactId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = contactFields(formData);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  try {
    const contact = await updateContact(contactId, user.id, {
      ...parsed.data,
      tags: tagsFromForm(parsed.data.tags ?? ""),
    });
    if (!contact) return { error: "Contact not found." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save contact." };
  }

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
  return undefined;
}

export async function attachContactsToProjectAction(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const contactIds = formData.getAll("contactId").filter((value): value is string => typeof value === "string");
  if (contactIds.length === 0) return { error: "Select at least one contact." };

  const result = await attachContactsToProject(user.id, projectId, contactIds);
  if ("error" in result && result.error) return { error: result.error };

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/contacts");
  return undefined;
}
