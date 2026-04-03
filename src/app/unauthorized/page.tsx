import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="flex justify-end border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          Your account is signed in, but{" "}
          <code className="rounded bg-zinc-200 px-1 text-xs dark:bg-zinc-800">
            profiles.is_superadmin
          </code>{" "}
          and{" "}
          <code className="rounded bg-zinc-200 px-1 text-xs dark:bg-zinc-800">
            profiles.is_matrix_admin
          </code>{" "}
          are not set for your user.
        </p>
        <Link
          href="/login"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Return to sign in
        </Link>
      </main>
    </div>
  );
}
