"use client";

import { deleteFlavor } from "@/app/flavors/actions";

export function DeleteFlavorButton({ flavorId }: { flavorId: string }) {
  return (
    <form action={deleteFlavor}>
      <input type="hidden" name="id" value={flavorId} />
      <button
        type="submit"
        className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:bg-zinc-900 dark:text-red-300 dark:hover:bg-red-950/40"
        onClick={(e) => {
          if (!confirm("Delete this humor flavor and all of its steps?")) {
            e.preventDefault();
          }
        }}
      >
        Delete
      </button>
    </form>
  );
}
