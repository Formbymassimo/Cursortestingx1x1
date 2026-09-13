import { prisma } from "@/lib/prisma";
import { parseGoogleFormUrl } from "@/lib/google-form-url";

const SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/forms.body.readonly",
  "https://www.googleapis.com/auth/forms.responses.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
];

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleSetupMessage() {
  return "Google is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, then set the OAuth redirect URI to this site’s /api/google/callback address.";
}

export function googleAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    throw new Error("Google did not accept the sign-in. Try connecting again.");
  }
  return (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    id_token?: string;
  };
}

export async function saveGoogleAccount(
  userId: string,
  tokens: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  },
) {
  const profile = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const info = profile.ok
    ? ((await profile.json()) as { email?: string })
    : {};

  const existing = await prisma.googleAccount.findUnique({ where: { userId } });
  const refreshToken = tokens.refresh_token ?? existing?.refreshToken;
  if (!refreshToken) {
    throw new Error(
      "Google did not return a refresh token. Disconnect the app in your Google account permissions, then connect again.",
    );
  }

  return prisma.googleAccount.upsert({
    where: { userId },
    update: {
      email: info.email ?? existing?.email,
      refreshToken,
      accessToken: tokens.access_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    },
    create: {
      userId,
      email: info.email,
      refreshToken,
      accessToken: tokens.access_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    },
  });
}

export async function getGoogleAccount(userId: string) {
  return prisma.googleAccount.findUnique({ where: { userId } });
}

export async function disconnectGoogle(userId: string) {
  await prisma.googleAccount.deleteMany({ where: { userId } });
}

async function accessTokenFor(userId: string) {
  const account = await prisma.googleAccount.findUnique({ where: { userId } });
  if (!account) throw new Error("Connect Google first.");
  if (account.accessToken && account.expiresAt && account.expiresAt > new Date(Date.now() + 30_000)) {
    return account.accessToken;
  }

  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    refresh_token: account.refreshToken,
    grant_type: "refresh_token",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    throw new Error("Could not refresh the Google connection. Try connecting again.");
  }
  const tokens = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  await prisma.googleAccount.update({
    where: { userId },
    data: {
      accessToken: tokens.access_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    },
  });
  return tokens.access_token;
}

async function googleGet<T>(userId: string, url: string): Promise<T> {
  const token = await accessTokenFor(userId);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      text.includes("accessNotConfigured")
        ? "Enable the Google Forms API and Google Drive API for your Google Cloud project."
        : "Google could not complete that request.",
    );
  }
  return (await response.json()) as T;
}

export async function listGoogleForms(userId: string) {
  const data = await googleGet<{ files?: { id: string; name: string }[] }>(
    userId,
    "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.form'%20and%20trashed=false&pageSize=50&fields=files(id,name)&orderBy=modifiedTime%20desc",
  );
  return data.files ?? [];
}

export async function getGoogleForm(userId: string, formId: string) {
  return googleGet<{
    formId: string;
    info?: { title?: string };
    responderUri?: string;
    items?: { title?: string; questionItem?: { question?: { questionId?: string } } }[];
  }>(userId, `https://forms.googleapis.com/v1/forms/${encodeURIComponent(formId)}`);
}

export async function linkGoogleForm(input: {
  userId: string;
  projectId: string;
  formUrlOrId: string;
}) {
  const project = await prisma.project.findFirst({
    where: { id: input.projectId, ownerId: input.userId },
    select: { id: true },
  });
  if (!project) return { error: "Project not found." };

  const parsed = parseGoogleFormUrl(input.formUrlOrId);
  if (!parsed.formId) {
    return {
      error:
        parsed.publishedUrl
          ? "That looks like a public fill link. Paste the form’s edit URL (the one that includes /edit), or pick the form from your Google list."
          : "Paste a Google Form edit URL, or pick a form from the list.",
    };
  }

  const form = await getGoogleForm(input.userId, parsed.formId);
  const title = form.info?.title || "Untitled form";
  const url = form.responderUri || parsed.publishedUrl || `https://docs.google.com/forms/d/${parsed.formId}/viewform`;

  const linked = await prisma.linkedGoogleForm.upsert({
    where: {
      projectId_formId: { projectId: project.id, formId: parsed.formId },
    },
    update: { title, url },
    create: {
      projectId: project.id,
      formId: parsed.formId,
      title,
      url,
    },
  });
  return { linked };
}

export async function unlinkGoogleForm(userId: string, linkedFormId: string) {
  const linked = await prisma.linkedGoogleForm.findFirst({
    where: { id: linkedFormId, project: { ownerId: userId } },
  });
  if (!linked) return { error: "Linked form not found." };
  await prisma.linkedGoogleForm.delete({ where: { id: linked.id } });
  return { ok: true };
}

export async function syncGoogleFormResponses(userId: string, linkedFormId: string) {
  const linked = await prisma.linkedGoogleForm.findFirst({
    where: { id: linkedFormId, project: { ownerId: userId } },
  });
  if (!linked) return { error: "Linked form not found." };

  const form = await getGoogleForm(userId, linked.formId);
  const questionTitles = new Map<string, string>();
  for (const item of form.items ?? []) {
    const questionId = item.questionItem?.question?.questionId;
    if (questionId) questionTitles.set(questionId, item.title || "Question");
  }

  const data = await googleGet<{
    responses?: {
      responseId: string;
      lastSubmittedTime?: string;
      respondentEmail?: string;
      answers?: Record<
        string,
        { textAnswers?: { answers?: { value?: string }[] } }
      >;
    }[];
  }>(
    userId,
    `https://forms.googleapis.com/v1/forms/${encodeURIComponent(linked.formId)}/responses`,
  );

  let upserted = 0;
  for (const response of data.responses ?? []) {
    const answers = Object.entries(response.answers ?? {}).map(([questionId, answer]) => ({
      question: questionTitles.get(questionId) || questionId,
      value: (answer.textAnswers?.answers ?? [])
        .map((item) => item.value)
        .filter(Boolean)
        .join(", "),
    }));

    await prisma.googleFormResponse.upsert({
      where: {
        linkedFormId_googleResponseId: {
          linkedFormId: linked.id,
          googleResponseId: response.responseId,
        },
      },
      update: {
        respondentEmail: response.respondentEmail ?? null,
        answersJson: JSON.stringify(answers),
        submittedAt: response.lastSubmittedTime
          ? new Date(response.lastSubmittedTime)
          : null,
      },
      create: {
        linkedFormId: linked.id,
        googleResponseId: response.responseId,
        respondentEmail: response.respondentEmail ?? null,
        answersJson: JSON.stringify(answers),
        submittedAt: response.lastSubmittedTime
          ? new Date(response.lastSubmittedTime)
          : null,
      },
    });
    upserted += 1;
  }

  if (form.responderUri) {
    await prisma.linkedGoogleForm.update({
      where: { id: linked.id },
      data: { url: form.responderUri, title: form.info?.title || linked.title },
    });
  }

  return { upserted };
}
