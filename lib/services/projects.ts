import { prisma } from "@/lib/prisma";

export async function listProjectsForUser(ownerId: string) {
  const projects = await prisma.project.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
    include: {
      questionnaires: {
        include: { _count: { select: { responses: true } } },
      },
    },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt,
    questionnaireCount: project.questionnaires.length,
    responseCount: project.questionnaires.reduce(
      (sum, questionnaire) => sum + questionnaire._count.responses,
      0,
    ),
  }));
}

export async function getProjectForUser(projectId: string, ownerId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, ownerId },
    include: {
      questionnaires: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { questions: true, responses: true } },
        },
      },
    },
  });
}

export async function createProject(
  ownerId: string,
  data: { name: string; description?: string },
) {
  return prisma.project.create({
    data: {
      ownerId,
      name: data.name,
      description: data.description || null,
    },
  });
}
