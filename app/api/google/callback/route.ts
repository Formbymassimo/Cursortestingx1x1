import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { exchangeGoogleCode, saveGoogleAccount } from "@/lib/services/google";
import { getAppUrl } from "@/lib/urls";

export async function GET(request: Request) {
  const user = await getSessionUser();
  const appUrl = await getAppUrl();
  if (!user) {
    return NextResponse.redirect(new URL("/login", appUrl));
  }

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent("Google sign-in was cancelled.")}`, appUrl),
    );
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const expected = jar.get("google_oauth_state")?.value;
  jar.delete("google_oauth_state");

  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent("Google sign-in could not be verified. Try again.")}`, appUrl),
    );
  }

  try {
    const redirectUri = `${appUrl}/api/google/callback`;
    const tokens = await exchangeGoogleCode(code, redirectUri);
    await saveGoogleAccount(user.id, tokens);
    return NextResponse.redirect(new URL("/settings?connected=1", appUrl));
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "Could not finish connecting Google.";
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(message)}`, appUrl),
    );
  }
}
