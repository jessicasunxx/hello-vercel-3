import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { HumorFlavor } from "@/types/humor";

type RunRow = {
  id: string;
  flavor_id: string | null;
  captions_text: string | null;
  error: string | null;
  created_at: string;
  image_url: string;
};

export default async function StatsPage() {
  const supabase = await createClient();

  const [
    { data: flavors, error: fErr },
    { data: runs, error: rErr },
  ] = await Promise.all([
    supabase
      .from("humor_flavors")
      .select("*")
      .order("name", { ascending: true }),
    supabase
      .from("humor_caption_runs")
      .select("id, flavor_id, captions_text, error, created_at, image_url")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  if (fErr || rErr) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
        Could not load statistics: {fErr?.message ?? rErr?.message}
      </div>
    );
  }

  const flavorList = (flavors ?? []) as HumorFlavor[];
  const runList = (runs ?? []) as RunRow[];

  const totalRuns = runList.length;
  const successRuns = runList.filter((r) => r.captions_text && !r.error).length;
  const errorRuns = runList.filter((r) => r.error).length;
  const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0;

  const flavorMap = new Map(flavorList.map((f) => [f.id, f.name]));

  const perFlavor = new Map<string, { name: string; total: number; success: number; errors: number }>();
  for (const run of runList) {
    const key = run.flavor_id ?? "unknown";
    const existing = perFlavor.get(key);
    if (existing) {
      existing.total++;
      if (run.error) existing.errors++;
      else if (run.captions_text) existing.success++;
    } else {
      perFlavor.set(key, {
        name: flavorMap.get(key) ?? "(deleted flavor)",
        total: 1,
        success: run.error ? 0 : run.captions_text ? 1 : 0,
        errors: run.error ? 1 : 0,
      });
    }
  }

  const perFlavorSorted = [...perFlavor.entries()].sort(
    (a, b) => b[1].total - a[1].total,
  );

  const uniqueImages = new Set(runList.map((r) => r.image_url)).size;

  const now = new Date();
  const last24h = runList.filter(
    (r) => now.getTime() - new Date(r.created_at).getTime() < 86_400_000,
  ).length;
  const last7d = runList.filter(
    (r) => now.getTime() - new Date(r.created_at).getTime() < 7 * 86_400_000,
  ).length;

  const avgCaptionLength =
    successRuns > 0
      ? Math.round(
          runList
            .filter((r) => r.captions_text)
            .reduce((sum, r) => sum + (r.captions_text?.length ?? 0), 0) /
            successRuns,
        )
      : 0;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/flavors" className="hover:underline">
            ← All flavors
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Caption statistics
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Aggregate metrics across all caption runs and humor flavors.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total runs" value={totalRuns} />
        <StatCard label="Successful" value={successRuns} accent="emerald" />
        <StatCard label="Errors" value={errorRuns} accent="red" />
        <StatCard label="Success rate" value={`${successRate}%`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Runs (last 24h)" value={last24h} />
        <StatCard label="Runs (last 7d)" value={last7d} />
        <StatCard label="Unique images tested" value={uniqueImages} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Total flavors" value={flavorList.length} />
        <StatCard label="Avg caption length" value={`${avgCaptionLength} chars`} />
      </div>

      {/* Per-flavor breakdown */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Runs by flavor
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Breakdown of caption generation attempts per humor flavor.
        </p>
        {perFlavorSorted.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            No runs yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  <th className="pb-2 pr-4">Flavor</th>
                  <th className="pb-2 pr-4 text-right">Total</th>
                  <th className="pb-2 pr-4 text-right">Success</th>
                  <th className="pb-2 pr-4 text-right">Errors</th>
                  <th className="pb-2 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {perFlavorSorted.map(([key, data]) => {
                  const rate =
                    data.total > 0
                      ? Math.round((data.success / data.total) * 100)
                      : 0;
                  return (
                    <tr key={key}>
                      <td className="py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {key !== "unknown" ? (
                          <Link
                            href={`/flavors/${key}`}
                            className="hover:underline"
                          >
                            {data.name}
                          </Link>
                        ) : (
                          data.name
                        )}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">{data.total}</td>
                      <td className="py-2 pr-4 text-right tabular-nums text-emerald-700 dark:text-emerald-400">
                        {data.success}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums text-red-600 dark:text-red-400">
                        {data.errors}
                      </td>
                      <td className="py-2 text-right tabular-nums">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent runs */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Recent caption runs
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Last 20 runs across all flavors.
        </p>
        {runList.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            No runs recorded yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {runList.slice(0, 20).map((run) => (
              <li
                key={run.id}
                className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/50"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{new Date(run.created_at).toLocaleString()}</span>
                  <span>·</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {run.flavor_id ? (flavorMap.get(run.flavor_id) ?? "Unknown") : "(no flavor)"}
                  </span>
                  <span>·</span>
                  <a
                    href={run.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-700 underline dark:text-zinc-300"
                  >
                    Image
                  </a>
                  <span>·</span>
                  {run.error ? (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300">
                      Error
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      Success
                    </span>
                  )}
                </div>
                {run.error ? (
                  <pre className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap rounded-md bg-red-50 p-2 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-200">
                    {run.error}
                  </pre>
                ) : (
                  <pre className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap rounded-md bg-white p-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                    {run.captions_text ?? "(no caption text)"}
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

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "emerald" | "red";
}) {
  const valueColor =
    accent === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : accent === "red"
        ? "text-red-600 dark:text-red-400"
        : "text-zinc-900 dark:text-zinc-50";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}
