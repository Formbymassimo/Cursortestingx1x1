import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTagInput, parseTags } from "@/lib/tags";

test("parseTagInput splits and de-duplicates tags", () => {
  assert.deepEqual(parseTagInput("student, Follow-up, student"), [
    "student",
    "Follow-up",
  ]);
});

test("parseTags reads stored JSON", () => {
  assert.deepEqual(parseTags('["student","demo"]'), ["student", "demo"]);
  assert.deepEqual(parseTags("not-json"), []);
});
