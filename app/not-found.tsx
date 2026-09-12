import Link from "next/link";
import { buttonClass, Card } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <Card>
        <h1 className="text-3xl">Page not found</h1>
        <p className="mt-3 text-muted">
          That project, questionnaire, or invite link does not exist, or you do
          not have access.
        </p>
        <Link href="/" className={`${buttonClass("primary")} mt-6`}>
          Back to Fieldbook
        </Link>
      </Card>
    </main>
  );
}
