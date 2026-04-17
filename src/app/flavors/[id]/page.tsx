import Link from "next/link";
import { notFound } from "next/navigation";
import { createStep, updateFlavor } from "@/app/flavors/actions";
import { createClient } from "@/lib/supabase/server";
import { DeleteFlavorButton } from "@/components/delete-flavor-button";
import { DuplicateFlavorButton } from "@/components/duplicate-flavor-button";
import { RunTestPanel } from "@/components/run-test-panel";
import { StepCard } from "@/components/step-card";
import type { HumorCaptionRun, HumorFlavor, HumorFlavorStep } from "@/types/humor";

type PageProps = { params: Promise<{ id: string }> };

export default async function FlavorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: flavor, error: fErr } = await supabase
    .from("humor_flavors")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fErr || !flavor) {
    notFound();
  }

  const { data: steps, error: sErr } = await supabase
    .from("humor_flavor_steps")
    .select("*")
    .eq("flavor_id", id)
    .order("position", { ascending: true });

  if (sErr) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {sErr.message}
      </p>
    );
  }

  const { data: runs, error: rErr } = await supabase
    .from("humor_caption_runs")
    .select("id, flavor_id, image_url, captions_text, error, created_at")
    .eq("flavor_id", id)
    .order("created_at", { ascending: false })
    .limit(40);

  if (rErr) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {rErr.message}
      </p>
    );
  }

  const f = flavor as HumorFlavor;
  const stepList = (steps ?? []) as HumorFlavorStep[];
  const runList = (runs ?? []) as HumorCaptionRun[];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/flavors" className="hover:underline">
              ← All flavors
            </Link>
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {f.name}
          </h1>
          {f.description ? (
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              {f.description}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <DuplicateFlavorButton flavorId={f.id} currentName={f.name} />
          <DeleteFlavorButton flavorId={f.id} />
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Edit flavor
        </h2>
        <form action={updateFlavor} className="mt-4 space-y-3">
          <input type="hidden" name="id" value={f.id} />
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Name
            </label>
            <input
              name="name"
              required
              defaultValue={f.name}
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
              defaultValue={f.description ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Save flavor
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Steps (ordered)
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Each step receives the prior step’s output plus the image context,
          depending on how the AlmostCrackd API implements your Assignment 5
          contract.
        </p>

        {stepList.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            No steps yet. Add the first one below.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {stepList.map((step, i) => (
              <StepCard
                key={step.id}
                flavorId={f.id}
                step={step}
                index={i}
                total={stepList.length}
              />
            ))}
          </ol>
        )}

        <form action={createStep.bind(null, f.id)} className="mt-6 space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
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
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Add step
          </button>
        </form>
      </section>

      <RunTestPanel flavorId={f.id} />

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Caption runs for this flavor
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Successful and failed API calls are logged for review.
        </p>
        {runList.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            No runs yet. Use “Generate captions” above.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {runList.map((run) => (
              <li
                key={run.id}
                className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/50"
              >
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(run.created_at).toLocaleString()} ·{" "}
                  <a
                    href={run.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-700 underline dark:text-zinc-300"
                  >
                    Image
                  </a>
                </p>
                {run.error ? (
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-red-50 p-2 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-200">
                    {run.error}
                  </pre>
                ) : (
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-white p-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                    {run.captions_text ?? "(no caption text parsed)"}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
