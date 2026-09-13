import { existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { upsertContactFromResponse } from "../lib/services/contacts";
import { createInviteToken } from "../lib/services/questionnaires";

if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

const prisma = new PrismaClient();

const DEMO_EMAIL = "researcher@fieldbook.test";
const DEMO_PASSWORD = "fieldbook-demo";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash, name: "Avery Chen" },
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      name: "Avery Chen",
    },
  });

  const existing = await prisma.project.findFirst({
    where: { ownerId: user.id, name: "Campus dining study" },
  });

  if (existing) {
    await backfillDemoContacts(user.id, existing.id);
    console.log("Demo data already exists.");
    console.log(`  Email: ${DEMO_EMAIL}`);
    console.log(`  Password: ${DEMO_PASSWORD}`);
    return;
  }

  const project = await prisma.project.create({
    data: {
      ownerId: user.id,
      name: "Campus dining study",
      description:
        "A short week-1 study of how students choose weekday meals. Replace this demo project with your own research.",
    },
  });

  const questionnaire = await prisma.questionnaire.create({
    data: {
      projectId: project.id,
      title: "Weekday lunch habits",
      inviteToken: createInviteToken(),
      questions: {
        create: [
          {
            sortOrder: 0,
            prompt: "What is your usual weekday lunch?",
            type: "SHORT_TEXT",
            required: true,
            optionsJson: "[]",
          },
          {
            sortOrder: 1,
            prompt: "What matters most when you choose that meal?",
            type: "LONG_TEXT",
            required: true,
            optionsJson: "[]",
          },
          {
            sortOrder: 2,
            prompt: "Where do you most often eat lunch?",
            type: "SINGLE_CHOICE",
            required: true,
            optionsJson: JSON.stringify([
              "Campus dining hall",
              "Cafe or restaurant nearby",
              "Packed from home",
              "Skip lunch",
            ]),
          },
          {
            sortOrder: 3,
            prompt: "Which of these influence your choice? Select all that apply.",
            type: "MULTIPLE_CHOICE",
            required: false,
            optionsJson: JSON.stringify([
              "Price",
              "Time",
              "Taste",
              "Dietary needs",
              "Friends' plans",
            ]),
          },
        ],
      },
    },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });

  const [shortText, longText, single, multiple] = questionnaire.questions;

  await prisma.response.create({
    data: {
      questionnaireId: questionnaire.id,
      participantName: "Jordan Lee",
      participantEmail: "jordan.lee@example.com",
      answers: {
        create: [
          { questionId: shortText.id, value: "Rice bowl from the dining hall" },
          {
            questionId: longText.id,
            value: "I need something filling that I can eat between classes.",
          },
          { questionId: single.id, value: "Campus dining hall" },
          { questionId: multiple.id, value: JSON.stringify(["Price", "Time"]) },
        ],
      },
    },
  });

  await backfillDemoContacts(user.id, project.id);

  console.log("Seeded demo researcher and sample study.");
  console.log(`  Email: ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log(`  Invite path: /q/${questionnaire.inviteToken}`);
}

async function backfillDemoContacts(ownerId: string, projectId: string) {
  const response = await prisma.response.findFirst({
    where: {
      questionnaire: { projectId },
      participantEmail: "jordan.lee@example.com",
    },
  });
  if (response) {
    const contact = await upsertContactFromResponse({
      ownerId,
      projectId,
      name: response.participantName,
      email: response.participantEmail,
    });
    if (contact && !response.contactId) {
      await prisma.response.update({
        where: { id: response.id },
        data: { contactId: contact.id },
      });
    }
  }

  const extra = await prisma.contact.findFirst({
    where: { ownerId, email: "sam.nguyen@example.com" },
  });
  if (!extra) {
    await prisma.contact.create({
      data: {
        ownerId,
        name: "Sam Nguyen",
        email: "sam.nguyen@example.com",
        phone: "555-0100",
        notes: "Demo contact you can pick for invites.",
        tagsJson: JSON.stringify(["student", "demo"]),
        projectLinks: {
          create: { projectId, invitedAt: new Date() },
        },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
