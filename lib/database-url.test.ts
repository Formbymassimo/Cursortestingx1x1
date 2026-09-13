import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { resolveDatabaseUrl } from "./database-url";

describe("resolveDatabaseUrl", () => {
  it("leaves Postgres URLs unchanged", () => {
    const url = "postgresql://fieldbook:fieldbook@localhost:5432/fieldbook";
    assert.equal(resolveDatabaseUrl(url), url);
  });

  it("pins a relative SQLite file to the repo root", () => {
    const root = "/workspace";
    assert.equal(resolveDatabaseUrl("file:./dev.db", root), "file:/workspace/dev.db");
  });

  it("keeps an absolute SQLite file", () => {
    assert.equal(
      resolveDatabaseUrl("file:/var/data/fieldbook.db"),
      "file:/var/data/fieldbook.db",
    );
  });
});
