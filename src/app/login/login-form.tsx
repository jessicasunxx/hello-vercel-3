"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/flavors";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    authError ? "Authentication failed. Try again." : null,
  );
  const [pending, setPending] = useState(false);

  const missingEnv =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (missingEnv) {
      setError("Supabase environment variables are not configured.");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setPending(false);
    if (signErr) {
      setError(signErr.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="flex justify-end border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Matrix or super admins only (checked via{" "}
            <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
              profiles
            </code>
            ).
          </p>

          {missingEnv ? (
            <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              Copy{" "}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">
                .env.example
              </code>{" "}
              to{" "}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">
                .env.local
              </code>{" "}
              and add your Supabase keys.
            </p>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
              />
            </div>
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:underline">
              Back home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
