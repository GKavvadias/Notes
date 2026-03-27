import Link from "next/link";
import { getSession } from "@/lib/auth";
import { HomeSignOutButton } from "@/components/HomeSignOutButton";

export default async function Home() {
  const session = await getSession();
  const isLoggedIn = !!session;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl font-bold text-center">Notes</h1>
        <div className="flex gap-4">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="px-6 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-700 transition-colors"
              >
                Dashboard
              </Link>
              <HomeSignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/authenticate"
                className="px-6 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/authenticate?mode=register"
                className="px-6 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-700 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
