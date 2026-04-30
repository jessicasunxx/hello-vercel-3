"use client";

import { useState, useTransition } from "react";
import { duplicateFlavor } from "@/app/flavors/actions";

export function DuplicateFlavorButton({
  flavorId,
  currentName,
}: {
  flavorId: string;
  currentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(`${currentName} (copy)`);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
          setName(`${currentName} (copy)`);
        }}
        className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
      >
        Duplicate
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dup-dialog-title"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
        >
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h3 id="dup-dialog-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Duplicate flavor
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Creates a copy of &quot;{currentName}&quot; with all of its steps.
              Provide a unique name for the new flavor.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                New flavor name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                autoFocus
              />
            </div>

            {error ? (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending || !name.trim()}
                onClick={() => {
                  startTransition(async () => {
                    setError(null);
                    const result = await duplicateFlavor(flavorId, name);
                    if (result) setError(result);
                  });
                }}
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                {pending ? "Duplicating…" : "Duplicate"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
