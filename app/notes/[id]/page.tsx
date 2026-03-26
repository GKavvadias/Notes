import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/Header";
import { getNoteById } from "@/lib/notes";
import { NoteRenderer } from "@/components/NoteRenderer";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const session = await getSession();
  if (!session) redirect("/authenticate");

  const { id } = await params;
  const note = getNoteById(id, session.user.id);
  if (!note) notFound();

  return (
    <main className="min-h-screen bg-background">
      <Header email={session.user.email} />
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-8 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {note.title}
          </h1>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${note.isPublic ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"}`}>
            {note.isPublic ? "Public" : "Private"}
          </span>
        </div>
        <NoteRenderer contentJson={note.contentJson} />
      </div>
    </main>
  );
}
