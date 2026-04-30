"use client";

import { useState, useTransition } from "react";
import { runCaptionTest } from "@/app/flavors/actions";
import { TEST_IMAGE_URLS } from "@/lib/test-images";

export function RunTestPanel({ flavorId }: { flavorId: string }) {
  const [imageUrl, setImageUrl] = useState(TEST_IMAGE_URLS[0]?.url ?? "");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Test with image set
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Pick a sample image, then call the AlmostCrackd API using this flavor’s
        ordered steps. Results are stored under “Caption runs”.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Test image
          </label>
          <select
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          >
            {TEST_IMAGE_URLS.map((img) => (
              <option key={img.url} value={img.url}>
                {img.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            disabled={pending || !imageUrl}
            onClick={() => {
              setMessage(null);
              setIsSuccess(false);
              startTransition(async () => {
                const res = await runCaptionTest(flavorId, imageUrl);
                if (res.ok) {
                  setMessage("Caption run completed. Scroll to caption runs.");
                  setIsSuccess(true);
                } else {
                  setMessage(res.error);
                  setIsSuccess(false);
                }
              });
            }}
            className="w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {pending ? "Calling API…" : "Generate captions"}
          </button>
        </div>
      </div>

      {imageUrl ? (
        <div className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Selected test"
            className="max-h-48 w-auto rounded-md border border-zinc-200 object-contain dark:border-zinc-700"
          />
        </div>
      ) : null}

      {message ? (
        <p
          className={`mt-3 text-sm ${isSuccess ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
