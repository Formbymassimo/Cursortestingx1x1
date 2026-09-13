import path from "node:path";

/**
 * Prisma CLI resolves `file:./dev.db` next to the schema file (`prisma/dev.db`).
 * Next.js resolves the same URL from the process working directory (`./dev.db`).
 * Pin relative SQLite paths to the repo root so local demo reads and writes one file.
 */
export function resolveDatabaseUrl(
  url = process.env.DATABASE_URL ?? "file:./dev.db",
  root = process.cwd(),
) {
  if (!url.startsWith("file:")) return url;
  const raw = url.slice("file:".length);
  if (raw.startsWith(":memory:")) return url;
  if (path.isAbsolute(raw)) return `file:${raw}`;
  return `file:${path.resolve(root, raw)}`;
}
