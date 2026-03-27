"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopNav(): React.ReactElement | null {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div className="fixed top-0 left-0 right-0 flex justify-center py-4 pointer-events-none z-50">
      <Link
        href="/"
        className="text-sm font-semibold tracking-tight pointer-events-auto hover:opacity-75"
      >
        Notes
      </Link>
    </div>
  );
}
