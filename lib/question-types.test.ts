import assert from "node:assert/strict";
import { test } from "node:test";
import { formatAnswerValue, parseOptions } from "@/lib/question-types";

test("parseOptions reads a JSON list of strings", () => {
  assert.deepEqual(parseOptions('["Price","Time"]'), ["Price", "Time"]);
  assert.deepEqual(parseOptions("not-json"), []);
});

test("formatAnswerValue joins multiple-choice answers", () => {
  assert.equal(
    formatAnswerValue("MULTIPLE_CHOICE", JSON.stringify(["Price", "Time"])),
    "Price, Time",
  );
  assert.equal(formatAnswerValue("SHORT_TEXT", "Rice bowl"), "Rice bowl");
});
