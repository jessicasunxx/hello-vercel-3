"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useIsClient();

  if (!mounted) {
    return (
      <span className="inline-flex h-9 w-[7.5rem] rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800" />
    );
  }

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
      <span className="sr-only">Theme</span>
      <select
        value={theme === "dark" || theme === "light" || theme === "system" ? theme : "system"}
        onChange={(e) => setTheme(e.target.value)}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
