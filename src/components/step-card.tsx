"use client";

import { useState, useTransition } from "react";
import {
  deleteStep,
  moveStep,
  updateStep,
} from "@/app/flavors/actions";
import type { HumorFlavorStep } from "@/types/humor";

export function StepCard({
  flavorId,
  step,
  index,
  total,
}: {
  flavorId: string;
  step: HumorFlavorStep;
  index: number;
  total: number;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function wrapAction(fn: () => Promise<void>) {
    startTransition(async () => {
      setErr(null);
      try {
        await fn();
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      }
    });
  }

  return (
    <li className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Step {index + 1}
            {step.title ? ` · ${step.title}` : ""}
          </p>
          {!editing ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-100">
              {step.prompt}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending || index === 0}
            onClick={() =>
              wrapAction(async () => {
                await moveStep(flavorId, step.id, "up");
              })
            }
            className="rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            Up
          </button>
          <button
            type="button"
            disabled={pending || index >= total - 1}
            onClick={() =>
              wrapAction(async () => {
                await moveStep(flavorId, step.id, "down");
              })
            }
            className="rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            Down
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setEditing((v) => !v)}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            {editing ? "Close" : "Edit"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              wrapAction(async () => {
                if (confirm("Delete this step?")) {
                  await deleteStep(flavorId, step.id);
                }
              })
            }
            className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:bg-zinc-900 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <form
          className="mt-4 space-y-3"
          action={async (formData) => {
            setErr(null);
            try {
              await updateStep(flavorId, step.id, formData);
              setEditing(false);
            } catch (e) {
              setErr(e instanceof Error ? e.message : String(e));
            }
          }}
        >
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Title (optional)
            </label>
            <input
              name="title"
              defaultValue={step.title ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Prompt
            </label>
            <textarea
              name="prompt"
              required
              rows={4}
              defaultValue={step.prompt}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Save step
          </button>
        </form>
      ) : null}

      {err ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{err}</p>
      ) : null}
    </li>
  );
}
