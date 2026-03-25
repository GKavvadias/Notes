import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage(): Promise<React.ReactElement> {
  const session = await getSession();
  if (!session) redirect("/authenticate");

  return (
    <main className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <p className="text-sm font-medium uppercase tracking-widest text-neutral-400">NoteApp</p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {session.user.email}
          </span>
          <SignOutButton />
        </div>
      </header>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          My Notes
        </h1>
      </div>
    </main>
  );
}
