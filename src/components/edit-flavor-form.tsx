"use client";

import { useState, useTransition } from "react";
import { updateFlavor } from "@/app/flavors/actions";
import type { HumorFlavor } from "@/types/humor";

export function EditFlavorForm({ flavor }: { flavor: HumorFlavor }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Edit flavor
      </h2>
      <form
        className="mt-4 space-y-3"
        action={(formData) => {
          setError(null);
          setSuccess(false);
          startTransition(async () => {
            try {
              await updateFlavor(formData);
              setSuccess(true);
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e));
            }
          });
        }}
      >
        <input type="hidden" name="id" value={flavor.id} />
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Name
          </label>
          <input
            name="name"
            required
            defaultValue={flavor.name}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            defaultValue={flavor.description ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
        {success ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Flavor saved.
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {pending ? "Saving…" : "Save flavor"}
        </button>
      </form>
    </section>
  );
}
