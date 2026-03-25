import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function NotePage(): Promise<React.ReactElement> {
  const session = await getSession();
  if (!session) redirect("/authenticate");

  return (
    <main>
      <h1>Note Editor</h1>
    </main>
  );
}
