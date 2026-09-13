import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/projects");

  return (
    <div className="min-h-full">
      <AppHeader />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-3xl">Sign in</h1>
        <p className="mt-2 text-muted">
          Researcher accounts only. Participants use an invite link instead.
        </p>
        <Card className="mt-6">
          <AuthForm action={loginAction} mode="login" />
        </Card>
        <p className="mt-4 text-sm text-muted">
          Need an account?{" "}
          <Link href="/register" className="text-accent underline">
            Create one
          </Link>
          . Demo login after setup: researcher@fieldbook.test / fieldbook-demo
        </p>
      </main>
    </div>
  );
}
