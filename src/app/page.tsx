import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="flex items-center justify-end gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <ThemeToggle />
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-20">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Humor prompt chain tool
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Manage humor flavors (ordered prompt steps), run tests against the
            AlmostCrackd API, and review saved caption outputs. Access is
            limited to users whose{" "}
            <code className="rounded bg-zinc-200 px-1 text-xs dark:bg-zinc-800">
              profiles
            </code>{" "}
            row has{" "}
            <code className="rounded bg-zinc-200 px-1 text-xs dark:bg-zinc-800">
              is_superadmin
            </code>{" "}
            or{" "}
            <code className="rounded bg-zinc-200 px-1 text-xs dark:bg-zinc-800">
              is_matrix_admin
            </code>{" "}
            set to true.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Sign in
          </Link>
          <Link
            href="/flavors"
            className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            Open tool (auth required)
          </Link>
        </div>
      </main>
    </div>
  );
}
