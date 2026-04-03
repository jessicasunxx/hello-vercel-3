"use client";

import { useActionState } from "react";
import { createFlavor } from "@/app/flavors/actions";

export function CreateFlavorForm() {
  const [error, dispatch, pending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await createFlavor(formData);
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : String(e);
      }
    },
    null,
  );

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        New humor flavor
      </h2>
      <form action={dispatch} className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Name
          </label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            placeholder="e.g. Dry observational"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            placeholder="Optional context for other admins"
          />
        </div>
        {error ? (
          <p className="sm:col-span-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
        <div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {pending ? "Creating…" : "Create and open"}
          </button>
        </div>
      </form>
    </section>
  );
}
