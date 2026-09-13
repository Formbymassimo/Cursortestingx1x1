import assert from "node:assert/strict";
import { test } from "node:test";
import { parseGoogleFormUrl } from "@/lib/google-form-url";

test("parseGoogleFormUrl reads an edit URL", () => {
  const parsed = parseGoogleFormUrl(
    "https://docs.google.com/forms/d/1AbCDefGhijK/edit",
  );
  assert.equal(parsed.formId, "1AbCDefGhijK");
  assert.equal(parsed.publishedUrl, null);
});

test("parseGoogleFormUrl does not treat a published fill link as an API id", () => {
  const parsed = parseGoogleFormUrl(
    "https://docs.google.com/forms/d/e/1FAIpQLSdExample/viewform",
  );
  assert.equal(parsed.formId, null);
  assert.ok(parsed.publishedUrl?.includes("/d/e/1FAIpQLSdExample/"));
});
