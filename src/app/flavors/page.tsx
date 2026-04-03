import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreateFlavorForm } from "@/components/create-flavor-form";
import { DeleteFlavorButton } from "@/components/delete-flavor-button";
import type { HumorFlavor } from "@/types/humor";

export default async function FlavorsPage() {
  const supabase = await createClient();
  const { data: flavors, error } = await supabase
    .from("humor_flavors")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
        Could not load flavors: {error.message}. Confirm Supabase env vars and
        that you ran <code className="rounded bg-red-100 px-1 dark:bg-red-900/60">supabase/schema.sql</code>.
      </div>
    );
  }

  const list = (flavors ?? []) as HumorFlavor[];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Prompt chain tool
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Humor flavors are ordered prompt steps. The last API response is
          parsed into caption text and saved with each test run.
        </p>
      </div>

      <CreateFlavorForm />

      <section>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          All flavors
        </h2>
        {list.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            No flavors yet. Create one above.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {list.map((f) => (
              <li
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <Link
                    href={`/flavors/${f.id}`}
                    className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    {f.name}
                  </Link>
                  {f.description ? (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {f.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/flavors/${f.id}`}
                    className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  >
                    Open
                  </Link>
                  <DeleteFlavorButton flavorId={f.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
