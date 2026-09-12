import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";

export default async function RegisterPage() {
  if (await getSessionUser()) redirect("/projects");

  return (
    <div className="min-h-full">
      <AppHeader />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-3xl">Create a researcher account</h1>
        <p className="mt-2 text-muted">
          Use email and password. Magic-link email sending is not part of this
          first version.
        </p>
        <Card className="mt-6">
          <AuthForm action={registerAction} mode="register" />
        </Card>
        <p className="mt-4 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent underline">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
