import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { googleAuthUrl, googleConfigured, googleSetupMessage } from "@/lib/services/google";
import { getAppUrl } from "@/lib/urls";
import { randomBytes } from "node:crypto";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", await getAppUrl()));
  }
  if (!googleConfigured()) {
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(googleSetupMessage())}`, await getAppUrl()),
    );
  }

  const state = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  const redirectUri = `${await getAppUrl()}/api/google/callback`;
  return NextResponse.redirect(googleAuthUrl(redirectUri, state));
}
