import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

await import(pathToFileURL(path.join(process.cwd(), "scripts", "prisma-prepare.mjs")).href);

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/prisma.mjs <prisma args>");
  process.exit(1);
}

const result = spawnSync(
  "npx",
  ["prisma", ...args, "--schema", "prisma/schema.generated.prisma"],
  { stdio: "inherit", env: process.env },
);

process.exit(result.status ?? 1);
