import { notFound } from "next/navigation";
import { getNoteBySlug } from "@/lib/notes";
import { NoteRenderer } from "@/components/NoteRenderer";

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.ReactElement> {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="mb-6 text-xs font-medium uppercase tracking-widest text-neutral-400">
          Shared note
        </p>
        <h1 className="mb-8 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {note.title}
        </h1>
        <NoteRenderer contentJson={note.contentJson} />
      </div>
    </main>
  );
}
