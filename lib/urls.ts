import { headers } from "next/headers";

export async function getAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!host) return "http://localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export function invitePath(token: string) {
  return `/q/${token}`;
}

export async function inviteUrl(token: string) {
  return `${await getAppUrl()}${invitePath(token)}`;
}
