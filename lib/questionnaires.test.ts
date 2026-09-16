import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickLatestQuestionnaire } from "./questionnaires";

describe("pickLatestQuestionnaire", () => {
  it("returns undefined for an empty list", () => {
    assert.equal(pickLatestQuestionnaire([]), undefined);
  });

  it("prefers the most recently updated questionnaire", () => {
    const older = { id: "a", updatedAt: new Date("2026-01-01") };
    const newer = { id: "b", updatedAt: new Date("2026-09-01") };
    assert.equal(pickLatestQuestionnaire([older, newer])?.id, "b");
    assert.equal(pickLatestQuestionnaire([newer, older])?.id, "b");
  });
});
