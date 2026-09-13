import { spawnSync } from "node:child_process";
import fs from "node:fs";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env: process.env });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!fs.existsSync(".env")) {
  fs.copyFileSync(".env.example", ".env");
  console.log("Created .env from .env.example (SQLite demo database).");
}

run("node", ["scripts/prisma.mjs", "generate"]);
run("node", ["scripts/prisma.mjs", "db", "push"]);
run("npx", ["tsx", "prisma/seed.ts"]);

console.log("\nFieldbook is ready.");
console.log("  npm run dev");
console.log("Demo login: researcher@fieldbook.test / fieldbook-demo\n");
