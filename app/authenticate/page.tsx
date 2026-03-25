import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";

export default async function AuthenticatePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const { mode } = await searchParams;
  const authMode = mode === "register" ? "register" : "login";

  return <AuthForm key={authMode} mode={authMode} />;
}
