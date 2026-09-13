import { sendInviteEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { markContactProject, normalizeEmail } from "@/lib/services/contacts";
import { inviteUrl } from "@/lib/urls";

export async function listInvitesForQuestionnaire(
  questionnaireId: string,
  ownerId: string,
) {
  return prisma.invite.findMany({
    where: {
      questionnaireId,
      questionnaire: { project: { ownerId } },
    },
    orderBy: { lastSentAt: "desc" },
    include: { contact: { select: { id: true, name: true, email: true } } },
  });
}

export async function sendQuestionnaireInvites(input: {
  ownerId: string;
  researcherName: string;
  questionnaireId: string;
  contactIds: string[];
  extraEmails: string[];
}) {
  const questionnaire = await prisma.questionnaire.findFirst({
    where: { id: input.questionnaireId, project: { ownerId: input.ownerId } },
    include: { project: true },
  });
  if (!questionnaire) return { error: "Questionnaire not found." };

  const contacts = input.contactIds.length
    ? await prisma.contact.findMany({
        where: { ownerId: input.ownerId, id: { in: input.contactIds } },
      })
    : [];

  const recipients: { email: string; contactId?: string; name?: string }[] = [];
  const seen = new Set<string>();

  for (const contact of contacts) {
    const email = normalizeEmail(contact.email);
    if (!email) {
      return {
        error: `${contact.name} does not have an email address. Add one before sending.`,
      };
    }
    if (seen.has(email)) continue;
    seen.add(email);
    recipients.push({ email, contactId: contact.id, name: contact.name });
  }

  for (const raw of input.extraEmails) {
    const email = normalizeEmail(raw);
    if (!email) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    const existing = await prisma.contact.findFirst({
      where: { ownerId: input.ownerId, email },
    });
    recipients.push({
      email,
      contactId: existing?.id,
      name: existing?.name,
    });
  }

  if (recipients.length === 0) {
    return { error: "Add at least one contact or email address." };
  }

  const link = await inviteUrl(questionnaire.inviteToken);
  let sent = 0;

  for (const recipient of recipients) {
    await sendInviteEmail({
      to: recipient.email,
      researcherName: input.researcherName,
      projectName: questionnaire.project.name,
      questionnaireTitle: questionnaire.title,
      inviteUrl: link,
    });

    const existing = await prisma.invite.findFirst({
      where: {
        questionnaireId: questionnaire.id,
        email: recipient.email,
      },
    });

    if (existing) {
      await prisma.invite.update({
        where: { id: existing.id },
        data: {
          lastSentAt: new Date(),
          sendCount: existing.sendCount + 1,
          contactId: recipient.contactId ?? existing.contactId,
        },
      });
    } else {
      await prisma.invite.create({
        data: {
          questionnaireId: questionnaire.id,
          email: recipient.email,
          contactId: recipient.contactId,
        },
      });
    }

    if (recipient.contactId) {
      await markContactProject(recipient.contactId, questionnaire.projectId, {
        invited: true,
      });
    }
    sent += 1;
  }

  return { sent };
}

export async function resendInvite(input: {
  ownerId: string;
  researcherName: string;
  inviteId: string;
}) {
  const invite = await prisma.invite.findFirst({
    where: {
      id: input.inviteId,
      questionnaire: { project: { ownerId: input.ownerId } },
    },
    include: {
      questionnaire: { include: { project: true } },
      contact: true,
    },
  });
  if (!invite) return { error: "Invite not found." };

  const link = await inviteUrl(invite.questionnaire.inviteToken);
  await sendInviteEmail({
    to: invite.email,
    researcherName: input.researcherName,
    projectName: invite.questionnaire.project.name,
    questionnaireTitle: invite.questionnaire.title,
    inviteUrl: link,
  });

  await prisma.invite.update({
    where: { id: invite.id },
    data: {
      lastSentAt: new Date(),
      sendCount: invite.sendCount + 1,
    },
  });

  if (invite.contactId) {
    await markContactProject(invite.contactId, invite.questionnaire.projectId, {
      invited: true,
    });
  }

  return { sent: 1 };
}
