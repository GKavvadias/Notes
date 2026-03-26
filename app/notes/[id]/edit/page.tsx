import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/Header";
import { getNoteById } from "@/lib/notes";
import { EditNoteForm } from "@/components/EditNoteForm";

export default async function EditNotePage({
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
        <h1 className="mb-6 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Edit Note
        </h1>
        <EditNoteForm note={note} />
      </div>
    </main>
  );
}
