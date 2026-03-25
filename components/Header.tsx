import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

interface HeaderProps {
  email: string;
}

export function Header({ email }: HeaderProps): React.ReactElement {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
      <Link
        href="/dashboard"
        className="text-sm font-semibold tracking-tight text-neutral-900 hover:opacity-75 dark:text-neutral-100"
      >
        Notes
      </Link>
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {email}
        </span>
        <SignOutButton />
      </div>
    </header>
  );
}
