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
        <h1 className="mb-6 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {note.title}
        </h1>
        <NoteRenderer contentJson={note.contentJson} />
      </div>
    </main>
  );
}
