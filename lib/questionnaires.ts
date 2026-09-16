export function pickLatestQuestionnaire<T extends { updatedAt: Date }>(
  questionnaires: T[],
) {
  if (questionnaires.length === 0) return undefined;
  return questionnaires.reduce((latest, item) =>
    item.updatedAt.getTime() > latest.updatedAt.getTime() ? item : latest,
  );
}
