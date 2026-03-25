import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/Header";
import { getNotesByUser } from "@/lib/notes";
import { NotesList } from "@/components/NotesList";

export default async function DashboardPage(): Promise<React.ReactElement> {
  const session = await getSession();
  if (!session) redirect("/authenticate");

  const notes = getNotesByUser(session.user.id);

  return (
    <main className="min-h-screen bg-background">
      <Header email={session.user.email} />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            My Notes
          </h1>
          <Link
            href="/notes/new"
            className="cursor-pointer rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
          >
            New Note
          </Link>
        </div>

        <NotesList notes={notes} />
      </div>
    </main>
  );
}
