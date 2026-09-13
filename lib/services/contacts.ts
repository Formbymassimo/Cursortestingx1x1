import { prisma } from "@/lib/prisma";
import { parseTagInput, parseTags, serializeTags } from "@/lib/tags";

export function normalizeEmail(email?: string | null) {
  const value = email?.trim().toLowerCase() ?? "";
  return value || null;
}

export async function listContactsForUser(
  ownerId: string,
  query?: string,
) {
  const contacts = await prisma.contact.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
    include: {
      projectLinks: {
        include: { project: { select: { id: true, name: true } } },
      },
      _count: { select: { responses: true, invites: true } },
    },
  });

  const needle = query?.trim().toLowerCase();
  if (!needle) return contacts.map(presentContact);

  return contacts
    .filter((contact) => {
      const tags = parseTags(contact.tagsJson).join(" ");
      const haystack = [
        contact.name,
        contact.email ?? "",
        contact.phone ?? "",
        contact.notes ?? "",
        tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    })
    .map(presentContact);
}

export async function getContactForUser(contactId: string, ownerId: string) {
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, ownerId },
    include: {
      projectLinks: {
        include: { project: { select: { id: true, name: true } } },
        orderBy: { updatedAt: "desc" },
      },
      responses: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          questionnaire: { select: { id: true, title: true, projectId: true } },
        },
      },
      invites: {
        orderBy: { lastSentAt: "desc" },
        take: 20,
        include: {
          questionnaire: { select: { id: true, title: true } },
        },
      },
    },
  });
  if (!contact) return null;
  return {
    ...presentContact(contact),
    notes: contact.notes,
    phone: contact.phone,
    projectLinks: contact.projectLinks,
    responses: contact.responses,
    invites: contact.invites,
  };
}

export async function createContact(
  ownerId: string,
  data: {
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
    tags?: string[];
  },
) {
  const email = normalizeEmail(data.email);
  if (email) {
    const existing = await prisma.contact.findFirst({
      where: { ownerId, email },
    });
    if (existing) {
      throw new Error("A contact with that email already exists.");
    }
  }

  return prisma.contact.create({
    data: {
      ownerId,
      name: data.name.trim(),
      email,
      phone: data.phone?.trim() || null,
      notes: data.notes?.trim() || null,
      tagsJson: serializeTags(data.tags ?? []),
    },
  });
}

export async function updateContact(
  contactId: string,
  ownerId: string,
  data: {
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
    tags?: string[];
  },
) {
  const current = await prisma.contact.findFirst({
    where: { id: contactId, ownerId },
  });
  if (!current) return null;

  const email = normalizeEmail(data.email);
  if (email) {
    const clash = await prisma.contact.findFirst({
      where: { ownerId, email, NOT: { id: contactId } },
    });
    if (clash) throw new Error("A contact with that email already exists.");
  }

  return prisma.contact.update({
    where: { id: contactId },
    data: {
      name: data.name.trim(),
      email,
      phone: data.phone?.trim() || null,
      notes: data.notes?.trim() || null,
      tagsJson: serializeTags(data.tags ?? []),
    },
  });
}

export async function upsertContactFromResponse(input: {
  ownerId: string;
  projectId: string;
  name?: string | null;
  email?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const name = input.name?.trim() || "";
  if (!email && !name) return null;

  let contact = email
    ? await prisma.contact.findFirst({ where: { ownerId: input.ownerId, email } })
    : null;

  if (contact) {
    contact = await prisma.contact.update({
      where: { id: contact.id },
      data: {
        name: contact.name || name || email || "Participant",
        email: contact.email ?? email,
      },
    });
  } else {
    contact = await prisma.contact.create({
      data: {
        ownerId: input.ownerId,
        name: name || email || "Participant",
        email,
      },
    });
  }

  await markContactProject(contact.id, input.projectId, { responded: true });
  return contact;
}

export async function markContactProject(
  contactId: string,
  projectId: string,
  flags: { invited?: boolean; responded?: boolean },
) {
  const existing = await prisma.contactProject.findUnique({
    where: { contactId_projectId: { contactId, projectId } },
  });
  const now = new Date();
  if (!existing) {
    return prisma.contactProject.create({
      data: {
        contactId,
        projectId,
        invitedAt: flags.invited ? now : null,
        respondedAt: flags.responded ? now : null,
      },
    });
  }

  return prisma.contactProject.update({
    where: { id: existing.id },
    data: {
      invitedAt: flags.invited ? existing.invitedAt ?? now : existing.invitedAt,
      respondedAt: flags.responded
        ? existing.respondedAt ?? now
        : existing.respondedAt,
    },
  });
}

export async function attachContactsToProject(
  ownerId: string,
  projectId: string,
  contactIds: string[],
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId },
    select: { id: true },
  });
  if (!project) return { error: "Project not found." };

  const contacts = await prisma.contact.findMany({
    where: { ownerId, id: { in: contactIds } },
    select: { id: true },
  });

  for (const contact of contacts) {
    await markContactProject(contact.id, project.id, { invited: true });
  }
  return { count: contacts.length };
}

export function relationLabel(link: {
  invitedAt: Date | null;
  respondedAt: Date | null;
}) {
  if (link.respondedAt && link.invitedAt) return "Invited · Responded";
  if (link.respondedAt) return "Responded";
  if (link.invitedAt) return "Invited";
  return "Linked";
}

function presentContact(contact: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  tagsJson: string;
  createdAt: Date;
  updatedAt: Date;
  projectLinks?: { project: { id: string; name: string }; invitedAt: Date | null; respondedAt: Date | null }[];
  _count?: { responses: number; invites: number };
}) {
  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    notes: contact.notes,
    tags: parseTags(contact.tagsJson),
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
    projectCount: contact.projectLinks?.length ?? 0,
    responseCount: contact._count?.responses ?? 0,
    inviteCount: contact._count?.invites ?? 0,
    projects: (contact.projectLinks ?? []).map((link) => ({
      ...link.project,
      relation: relationLabel(link),
    })),
  };
}

export function tagsFromForm(value: string) {
  return parseTagInput(value);
}
