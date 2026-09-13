import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "prisma", "schema.prisma");
const destPath = path.join(root, "prisma", "schema.generated.prisma");

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const url = process.env.DATABASE_URL;
if (url.startsWith("file:") && !url.startsWith("file::")) {
  const raw = url.slice("file:".length);
  if (!path.isAbsolute(raw)) {
    process.env.DATABASE_URL = `file:${path.resolve(root, raw)}`;
  }
}
const provider = url.startsWith("postgres") ? "postgresql" : "sqlite";
const source = fs.readFileSync(sourcePath, "utf8");
const generated = source.replace(
  /provider = "(sqlite|postgresql)"/,
  `provider = "${provider}"`,
);

fs.writeFileSync(destPath, generated);
console.log(`Prisma provider: ${provider}`);
