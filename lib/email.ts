import { Resend } from "resend";

const LOG_SOURCE = "fieldbook.email";

export function readEnv(name: string, env: NodeJS.Dict<string> = process.env) {
  const value = env[name];
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || undefined;
}

export function emailConfigStatus(env: NodeJS.Dict<string> = process.env) {
  const missing: string[] = [];
  if (!readEnv("RESEND_API_KEY", env)) missing.push("RESEND_API_KEY");
  if (!readEnv("EMAIL_FROM", env)) missing.push("EMAIL_FROM");
  return {
    ready: missing.length === 0,
    missing,
  };
}

export function emailConfigured(env: NodeJS.Dict<string> = process.env) {
  return emailConfigStatus(env).ready;
}

export function emailSetupMessage(env: NodeJS.Dict<string> = process.env) {
  const { missing } = emailConfigStatus(env);
  if (missing.length === 0) {
    return "Email sending is configured.";
  }
  const listed = missing.join(" and ");
  return `This environment is missing ${listed}. In Vercel, Production and Preview have separate env vars — set them for the environment you are using, then redeploy. You can still copy the invite link.`;
}

export function emailBlockedMessage(env: NodeJS.Dict<string> = process.env) {
  return `Send was blocked. ${emailSetupMessage(env)}`;
}

export function parseRecipientEmails(value: string) {
  const tokens = value
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const emails: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    const email = token.toLowerCase();
    if (!isEmailAddress(email)) {
      invalid.push(token);
      continue;
    }
    if (seen.has(email)) continue;
    seen.add(email);
    emails.push(email);
  }

  return { emails, invalid };
}

export function isEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function logEmailEvent(
  level: "info" | "error",
  event: string,
  extra: Record<string, unknown> = {},
) {
  const payload = { source: LOG_SOURCE, event, ...extra };
  if (level === "error") {
    console.error(payload);
    return;
  }
  console.info(payload);
}

function recipientDomain(email: string) {
  const at = email.lastIndexOf("@");
  return at === -1 ? "unknown" : email.slice(at + 1);
}

export async function sendInviteEmail(input: {
  to: string;
  researcherName: string;
  projectName: string;
  questionnaireTitle: string;
  inviteUrl: string;
}) {
  const apiKey = readEnv("RESEND_API_KEY");
  const from = readEnv("EMAIL_FROM");
  if (!apiKey || !from) {
    const message = emailBlockedMessage();
    logEmailEvent("error", "not_configured", {
      missing: emailConfigStatus().missing,
    });
    throw new Error(message);
  }

  const resend = new Resend(apiKey);
  const subject = `Invitation to take part: ${input.questionnaireTitle}`;
  const text = [
    `Hello,`,
    ``,
    `You are invited to answer a short research questionnaire.`,
    ``,
    `Study: ${input.projectName}`,
    `Questionnaire: ${input.questionnaireTitle}`,
    ``,
    `Your answers will be used for research. You can leave your name and email blank on the form if you prefer.`,
    ``,
    `Open the questionnaire: ${input.inviteUrl}`,
    ``,
    `Thank you,`,
    `${input.researcherName} via Fieldbook`,
  ].join("\n");

  const html = `
    <p>Hello,</p>
    <p>You are invited to answer a short research questionnaire.</p>
    <p>
      <strong>Study:</strong> ${escapeHtml(input.projectName)}<br />
      <strong>Questionnaire:</strong> ${escapeHtml(input.questionnaireTitle)}
    </p>
    <p>Your answers will be used for research. You can leave your name and email blank on the form if you prefer.</p>
    <p><a href="${escapeHtml(input.inviteUrl)}">Open the questionnaire</a></p>
    <p>Thank you,<br />${escapeHtml(input.researcherName)} via Fieldbook</p>
  `;

  let result: { data?: { id?: string } | null; error?: { message?: string } | null };
  try {
    result = await resend.emails.send({
      from,
      to: input.to,
      subject,
      text,
      html,
    });
  } catch (error) {
    logEmailEvent("error", "provider_threw", {
      domain: recipientDomain(input.to),
      message: error instanceof Error ? error.message : "unknown",
    });
    throw new Error("The email provider could not be reached. Try again, or copy the invite link.");
  }

  if (result.error || !result.data?.id) {
    logEmailEvent("error", "provider_rejected", {
      domain: recipientDomain(input.to),
      message: result.error?.message ?? "no_message_id",
    });
    throw new Error(result.error?.message || "The email provider rejected this send.");
  }

  logEmailEvent("info", "sent", {
    domain: recipientDomain(input.to),
    messageId: result.data.id,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
