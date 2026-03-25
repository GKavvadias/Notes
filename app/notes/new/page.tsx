import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/Header";
import { NewNoteForm } from "@/components/NewNoteForm";

export default async function NewNotePage(): Promise<React.ReactElement> {
  const session = await getSession();
  if (!session) redirect("/authenticate");

  return (
    <main className="min-h-screen bg-background">
      <Header email={session.user.email} />
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="mb-6 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          New Note
        </h1>
        <NewNoteForm />
      </div>
    </main>
  );
}
