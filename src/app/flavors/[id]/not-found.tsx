import Link from "next/link";

export default function FlavorNotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Flavor not found
      </h1>
      <Link
        href="/flavors"
        className="mt-4 inline-block text-sm text-zinc-600 underline dark:text-zinc-400"
      >
        Back to all flavors
      </Link>
    </div>
  );
}
