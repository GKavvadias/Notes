"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

const inputClass =
  "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus-visible:border-neutral-500 dark:focus-visible:ring-neutral-700";

const labelClass =
  "text-sm font-medium text-neutral-700 dark:text-neutral-300";

export function AuthForm({ mode }: AuthFormProps): React.ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isRegister = mode === "register";

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = isRegister
      ? await authClient.signUp.email({ email, password, name: email })
      : await authClient.signIn.email({ email, password });

    if (result.error) {
      setError(result.error.message ?? "Something went wrong.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  const toggleHref = isRegister ? "/authenticate?mode=login" : "/authenticate?mode=register";
  const toggleLabel = isRegister ? "Already have an account? Sign in" : "No account yet? Register";
  const submitLabel = isRegister ? "Create account" : "Sign in";
  const heading = isRegister ? "Create an account" : "Welcome back";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-neutral-400">
            NoteApp
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {heading}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleEmailChange}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              value={password}
              onChange={handlePasswordChange}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 cursor-pointer rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {isLoading ? "Please wait…" : submitLabel}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          <Link
            href={toggleHref}
            className="hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            {toggleLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
