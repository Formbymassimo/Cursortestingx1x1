import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emailConfigStatus,
  emailSetupMessage,
  parseRecipientEmails,
} from "./email";

describe("emailConfigStatus", () => {
  it("names each missing variable", () => {
    assert.deepEqual(emailConfigStatus({}), {
      ready: false,
      missing: ["RESEND_API_KEY", "EMAIL_FROM"],
    });
    assert.deepEqual(
      emailConfigStatus({ RESEND_API_KEY: " re_test ", EMAIL_FROM: "  " }),
      { ready: false, missing: ["EMAIL_FROM"] },
    );
    assert.deepEqual(
      emailConfigStatus({
        RESEND_API_KEY: "re_test",
        EMAIL_FROM: "Fieldbook <studies@example.com>",
      }),
      { ready: true, missing: [] },
    );
  });

  it("explains which env var is missing without printing secrets", () => {
    const message = emailSetupMessage({ RESEND_API_KEY: "re_secret" });
    assert.match(message, /EMAIL_FROM/);
    assert.doesNotMatch(message, /re_secret/);
    assert.match(message, /Production and Preview/);
  });
});

describe("parseRecipientEmails", () => {
  it("splits commas, spaces, and semicolons", () => {
    assert.deepEqual(
      parseRecipientEmails("one@example.com, two@example.com; three@example.com"),
      {
        emails: ["one@example.com", "two@example.com", "three@example.com"],
        invalid: [],
      },
    );
  });

  it("reports invalid tokens instead of dropping them silently", () => {
    assert.deepEqual(parseRecipientEmails("not-an-email, ok@example.com"), {
      emails: ["ok@example.com"],
      invalid: ["not-an-email"],
    });
  });
});
