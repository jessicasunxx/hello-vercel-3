"use client";

import { useRef, useState, useTransition } from "react";
import { createStep } from "@/app/flavors/actions";

export function AddStepForm({ flavorId }: { flavorId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className="mt-6 space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await createStep(flavorId, formData);
            formRef.current?.reset();
          } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
          }
        });
      }}
    >
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Add step
      </h3>
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
          Title (optional)
        </label>
        <input
          name="title"
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          placeholder="Describe scene"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
          Prompt
        </label>
        <textarea
          name="prompt"
          required
          rows={3}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          placeholder="Instructions for the model for this chain step"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {pending ? "Adding…" : "Add step"}
      </button>
    </form>
  );
}
