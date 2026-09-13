import { Resend } from "resend";

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function emailSetupMessage() {
  return "Email sending is not configured. Add RESEND_API_KEY and EMAIL_FROM to your environment, then try again. You can still copy the invite link.";
}

export async function sendInviteEmail(input: {
  to: string;
  researcherName: string;
  projectName: string;
  questionnaireTitle: string;
  inviteUrl: string;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error(emailSetupMessage());
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
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

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: input.to,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message || "The email provider rejected this send.");
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
