import { AppHeader } from "@/components/AppHeader";
import { requireUser } from "@/lib/auth";

export default async function ResearcherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-full">
      <AppHeader user={user} />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
