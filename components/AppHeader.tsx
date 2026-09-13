import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { buttonClass } from "@/components/ui";

export function AppHeader({
  user,
}: {
  user?: { name: string; email: string } | null;
}) {
  return (
    <header className="border-b border-line bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href={user ? "/projects" : "/"} className="serif text-xl tracking-tight">
          Fieldbook
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-3">
          {user ? (
            <>
              <Link href="/projects" className={buttonClass("ghost")}>
                Projects
              </Link>
              <Link href="/contacts" className={buttonClass("ghost")}>
                Contacts
              </Link>
              <Link href="/settings" className={buttonClass("ghost")}>
                Settings
              </Link>
              <span className="hidden text-muted lg:inline">{user.email}</span>
              <form action={logoutAction}>
                <button type="submit" className={buttonClass("ghost")}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonClass("ghost")}>
                Sign in
              </Link>
              <Link href="/register" className={buttonClass("primary")}>
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
